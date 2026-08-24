import { db, type Book } from '../storage/db';
import { saveBookFile, deleteBookFile } from '../storage/opfs';
import { parseBookForLibrary } from '../epub/loader';

export class EpubParseError extends Error {}

export async function addBookToLibrary(file: File): Promise<Book> {
	let info;
	try {
		info = await parseBookForLibrary(file);
	} catch (err) {
		throw new EpubParseError(
			`Couldn't read "${file.name}" as an EPUB. ${err instanceof Error ? err.message : ''}`.trim()
		);
	}

	const id = crypto.randomUUID();
	const { usesOpfs } = await saveBookFile(id, file);

	const book: Book = {
		id,
		title: info.title,
		author: info.author,
		coverBlob: info.coverBlob,
		addedAt: Date.now(),
		lastOpenedAt: Date.now(),
		progressFraction: 0,
		lastCfi: null,
		tocJson: info.tocJson,
		metadataJson: info.metadataJson,
		usesOpfs
	};
	await db.books.put(book);
	return book;
}

export async function removeBookFromLibrary(book: Book): Promise<void> {
	await deleteBookFile(book.id, book.usesOpfs);
	await db.books.delete(book.id);
	await db.bookmarks.where('bookId').equals(book.id).delete();
}

export async function listLibraryBooks(): Promise<Book[]> {
	return db.books.orderBy('lastOpenedAt').reverse().toArray();
}
