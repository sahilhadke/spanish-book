import { base } from '$app/paths';

export interface ConjugationAnalysis {
	infinitive: string;
	mood: string;
	tense: string;
	person: string;
	number: string;
	isParticiple?: true;
}

type ConjugationTable = Record<string, ConjugationAnalysis[]>;

let tablePromise: Promise<ConjugationTable> | null = null;

function loadTable(): Promise<ConjugationTable> {
	if (!tablePromise) {
		tablePromise = fetch(`${base}/data/conjugations.json`).then((res) => {
			if (!res.ok) throw new Error(`Failed to load conjugation table: ${res.status}`);
			return res.json() as Promise<ConjugationTable>;
		});
	}
	return tablePromise;
}

/** Reverse-looks-up a surface form (e.g. "hablé") against the bundled, pre-generated conjugation table. Fully offline once the table has loaded once. */
export async function lookupConjugation(surfaceForm: string): Promise<ConjugationAnalysis[]> {
	const key = surfaceForm.trim().toLowerCase();
	if (!key) return [];
	try {
		const table = await loadTable();
		return table[key] ?? [];
	} catch {
		return [];
	}
}
