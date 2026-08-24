export interface DictionarySense {
	partOfSpeech: string;
	definition: string;
}

export interface DictionaryResult {
	word: string;
	senses: DictionarySense[];
}

function stripHtml(html: string): string {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent?.trim() ?? '';
}

/** Wiktionary's REST definition endpoint is CORS-open (verified: access-control-allow-origin: *) and needs no key or backend. */
export async function fetchDictionaryEntry(word: string): Promise<DictionaryResult | null> {
	const key = word.trim().toLowerCase();
	if (!key) return null;

	let res: Response;
	try {
		res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(key)}`);
	} catch {
		return null; // offline or blocked — caller falls back to conjugation-only info
	}
	if (!res.ok) return null;

	const data = (await res.json()) as Record<string, Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string }> }>>;
	const esEntries = data.es;
	if (!Array.isArray(esEntries) || esEntries.length === 0) return null;

	const senses: DictionarySense[] = [];
	for (const entry of esEntries) {
		const partOfSpeech = entry.partOfSpeech ?? '';
		for (const def of entry.definitions ?? []) {
			const text = stripHtml(def.definition ?? '');
			if (text) senses.push({ partOfSpeech, definition: text });
			if (senses.length >= 3) break;
		}
		if (senses.length >= 3) break;
	}
	return senses.length ? { word: key, senses } : null;
}
