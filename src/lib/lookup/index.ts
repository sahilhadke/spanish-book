import { lookupConjugation, type ConjugationAnalysis } from './conjugation';
import { fetchDictionaryEntry, type DictionaryResult } from './dictionary';
import { getCachedLookup, setCachedLookup } from './cache';

export interface LookupResult {
	word: string;
	lemma: string | null;
	conjugation: ConjugationAnalysis[] | null;
	dictionary: DictionaryResult | null;
	isPhrase: boolean;
}

/**
 * Tier-1 lookup: instant conjugation reverse-lookup (fully offline, bundled
 * dataset) + a dictionary gloss (Wiktionary, cached in IndexedDB after the
 * first fetch so repeat lookups work offline). Never throws — degrades to
 * whatever pieces resolved.
 */
export async function lookup(rawSelection: string): Promise<LookupResult> {
	const trimmed = rawSelection.trim();
	if (!trimmed) return { word: trimmed, lemma: null, conjugation: null, dictionary: null, isPhrase: false };

	const isPhrase = /\s/.test(trimmed);
	if (isPhrase) {
		return { word: trimmed, lemma: null, conjugation: null, dictionary: null, isPhrase: true };
	}

	const word = trimmed.toLowerCase();
	const cached = await getCachedLookup<LookupResult>(word);
	if (cached) return cached;

	const conjugation = await lookupConjugation(word);
	const lemma = conjugation[0]?.infinitive ?? null;
	const dictionaryTarget = lemma && lemma !== word ? lemma : word;
	const dictionary = await fetchDictionaryEntry(dictionaryTarget);

	const result: LookupResult = {
		word: trimmed,
		lemma,
		conjugation: conjugation.length ? conjugation : null,
		dictionary,
		isPhrase: false
	};

	// Only cache a result that actually resolved to something — a bare
	// network failure shouldn't get "stuck" as a cached miss.
	if (conjugation.length || dictionary) await setCachedLookup(word, 'dictionary', result);
	return result;
}
