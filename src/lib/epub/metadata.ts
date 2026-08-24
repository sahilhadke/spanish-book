import type { FoliateBook } from './types';

const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

/** A book's title/language fields can be a plain string or a { lang: value } map — take the first value either way. */
export function formatLanguageMap(x: string | Record<string, string> | undefined | null): string {
	if (!x) return '';
	if (typeof x === 'string') return x;
	const keys = Object.keys(x);
	return keys.length ? x[keys[0]] : '';
}

function formatOneContributor(contributor: unknown): string {
	if (typeof contributor === 'string') return contributor;
	if (contributor && typeof contributor === 'object' && 'name' in contributor) {
		return formatLanguageMap((contributor as { name?: string | Record<string, string> }).name);
	}
	return '';
}

export function formatContributor(contributor: unknown): string {
	if (Array.isArray(contributor)) {
		return listFormat.format(contributor.map(formatOneContributor).filter(Boolean));
	}
	return formatOneContributor(contributor);
}

export interface BookCardInfo {
	title: string;
	author: string;
	coverBlob: Blob | null;
	tocJson: string;
	metadataJson: string;
}

export async function extractBookCardInfo(book: FoliateBook): Promise<BookCardInfo> {
	const title = formatLanguageMap(book.metadata?.title) || 'Untitled book';
	const author = formatContributor(book.metadata?.author);
	let coverBlob: Blob | null = null;
	try {
		coverBlob = (await book.getCover?.()) ?? null;
	} catch {
		coverBlob = null;
	}
	return {
		title,
		author,
		coverBlob,
		tocJson: JSON.stringify(book.toc ?? []),
		metadataJson: JSON.stringify(book.metadata ?? {})
	};
}
