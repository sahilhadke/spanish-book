import type { FoliateBook } from './types';
import { extractBookCardInfo, type BookCardInfo } from './metadata';

/** Parses just enough of an EPUB (metadata/TOC/cover) for a library card, without creating a renderer. */
export async function parseBookForLibrary(file: File): Promise<BookCardInfo> {
	const { makeBook } = await import('foliate-js/view.js');
	const book = (await makeBook(file)) as FoliateBook;
	return extractBookCardInfo(book);
}
