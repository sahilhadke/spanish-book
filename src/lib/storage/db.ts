import Dexie, { type EntityTable } from 'dexie';

export interface Book {
	id: string;
	title: string;
	author: string;
	coverBlob: Blob | null;
	addedAt: number;
	lastOpenedAt: number;
	progressFraction: number;
	lastCfi: string | null;
	tocJson: string;
	metadataJson: string;
	usesOpfs: boolean;
}

export interface Bookmark {
	id: string;
	bookId: string;
	cfi: string;
	label: string;
	createdAt: number;
}

export interface VocabularyEntry {
	id: string;
	word: string;
	lemma: string | null;
	bookId: string;
	bookTitle: string;
	context: string;
	gloss: string;
	pos: string | null;
	gender: string | null;
	addedAt: number;
}

export interface TranslationCacheEntry {
	id: string; // hash of normalized word (+ context, when context-sensitive)
	word: string;
	resultJson: string;
	source: 'dictionary' | 'ai';
	cachedAt: number;
}

export interface SettingEntry {
	key: string;
	value: unknown;
}

export interface BookFile {
	id: string; // matches Book.id — only used when OPFS is unavailable
	blob: Blob;
}

export class LecturaDB extends Dexie {
	books!: EntityTable<Book, 'id'>;
	bookmarks!: EntityTable<Bookmark, 'id'>;
	vocabulary!: EntityTable<VocabularyEntry, 'id'>;
	translationCache!: EntityTable<TranslationCacheEntry, 'id'>;
	settings!: EntityTable<SettingEntry, 'key'>;
	bookFiles!: EntityTable<BookFile, 'id'>;

	constructor() {
		super('LecturaDB');
		this.version(1).stores({
			books: 'id, addedAt, lastOpenedAt, title',
			bookmarks: 'id, bookId, createdAt',
			vocabulary: 'id, word, lemma, bookId, addedAt',
			translationCache: 'id, word, cachedAt',
			settings: 'key',
			bookFiles: 'id'
		});
	}
}

export const db = new LecturaDB();
