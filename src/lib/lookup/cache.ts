import { db, type TranslationCacheEntry } from '../storage/db';

async function hashKey(input: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function getCachedLookup<T>(word: string): Promise<T | null> {
	const id = await hashKey(word.trim().toLowerCase());
	const entry = await db.translationCache.get(id);
	return entry ? (JSON.parse(entry.resultJson) as T) : null;
}

export async function setCachedLookup(
	word: string,
	source: TranslationCacheEntry['source'],
	result: unknown
): Promise<void> {
	const id = await hashKey(word.trim().toLowerCase());
	await db.translationCache.put({
		id,
		word: word.trim().toLowerCase(),
		resultJson: JSON.stringify(result),
		source,
		cachedAt: Date.now()
	});
}
