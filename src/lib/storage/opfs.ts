import { db } from './db';

function opfsSupported(): boolean {
	return typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage;
}

async function getBooksDir(): Promise<FileSystemDirectoryHandle> {
	const root = await navigator.storage.getDirectory();
	return root.getDirectoryHandle('books', { create: true });
}

/** Persists the raw EPUB file. Prefers OPFS; falls back to an IndexedDB blob (`bookFiles`) when OPFS is unavailable. */
export async function saveBookFile(id: string, file: File | Blob): Promise<{ usesOpfs: boolean }> {
	if (opfsSupported()) {
		try {
			const dir = await getBooksDir();
			const handle = await dir.getFileHandle(id, { create: true });
			const writable = await handle.createWritable();
			await writable.write(file);
			await writable.close();
			return { usesOpfs: true };
		} catch {
			// fall through to IndexedDB fallback
		}
	}
	await db.bookFiles.put({ id, blob: file instanceof Blob ? file : new Blob([file]) });
	return { usesOpfs: false };
}

export async function loadBookFile(id: string, usesOpfs: boolean): Promise<File | Blob> {
	if (usesOpfs && opfsSupported()) {
		const dir = await getBooksDir();
		const handle = await dir.getFileHandle(id);
		return handle.getFile();
	}
	const record = await db.bookFiles.get(id);
	if (!record) throw new Error(`Book file not found for id "${id}"`);
	return record.blob;
}

export async function deleteBookFile(id: string, usesOpfs: boolean): Promise<void> {
	if (usesOpfs && opfsSupported()) {
		try {
			const dir = await getBooksDir();
			await dir.removeEntry(id);
		} catch {
			// already gone — nothing to do
		}
		return;
	}
	await db.bookFiles.delete(id);
}
