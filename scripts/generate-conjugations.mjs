// Build-time only: pre-generates a reverse conjugation lookup table
// (surface form -> possible {infinitive, mood, tense, person, number}
// analyses) using the `conjugator` package as a rule engine. Nothing here
// ships to the browser — the output is a static JSON file loaded at runtime.
//
// Run with: npm run gen:conjugations
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import conjugateVerb from 'conjugator';
import { VERBS } from './verb-list.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Lives under SvelteKit's static/ dir so it's served as a plain asset and
// fetched lazily at runtime, rather than bundled into the JS chunk.
const outDir = join(__dirname, '..', 'static', 'data');
const outFile = join(outDir, 'conjugations.json');

/** @typedef {{ infinitive: string, mood: string, tense: string, person: string, number: string, isParticiple?: true }} Analysis */

/** @type {Map<string, Analysis[]>} */
const table = new Map();

function addForm(form, analysis) {
	const key = form.trim().toLowerCase();
	if (!key) return;
	const existing = table.get(key) ?? [];
	const dup = existing.some(
		(a) =>
			a.infinitive === analysis.infinitive &&
			a.mood === analysis.mood &&
			a.tense === analysis.tense &&
			a.person === analysis.person &&
			a.number === analysis.number
	);
	if (!dup) existing.push(analysis);
	table.set(key, existing);
}

const verbs = [...new Set(VERBS)].sort();
let failures = 0;

for (const infinitive of verbs) {
	let conjugation;
	try {
		conjugation = conjugateVerb(infinitive);
	} catch (err) {
		failures++;
		console.warn(`skip "${infinitive}": ${err instanceof Error ? err.message : err}`);
		continue;
	}
	for (const [mood, tenses] of Object.entries(conjugation)) {
		for (const [tense, numbers] of Object.entries(tenses)) {
			for (const [number, persons] of Object.entries(numbers)) {
				for (const [person, form] of Object.entries(persons)) {
					if (!form) continue;
					if (form.includes(' ')) {
						// compound tense ("he hablado") — index the participle token
						// on its own, since that's what a reader will actually select.
						// The participle form itself doesn't vary by mood/tense/person/
						// number, so a single analysis per infinitive is enough.
						const participle = form.split(' ').pop();
						addForm(participle, { infinitive, mood: 'participle', tense: 'past participle', person: '', number: '', isParticiple: true });
					} else {
						addForm(form, { infinitive, mood, tense, person, number });
					}
				}
			}
		}
	}
	// the infinitive itself should resolve to a trivial "this is the base form" entry
	addForm(infinitive, { infinitive, mood: 'infinitive', tense: 'infinitive', person: '', number: '' });
}

const json = Object.fromEntries(table);
await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(json), 'utf-8');

console.log(
	`Generated ${outFile}: ${verbs.length} verbs (${failures} failed), ${table.size} distinct surface forms.`
);
