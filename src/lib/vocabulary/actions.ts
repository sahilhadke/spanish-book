import { db } from '../storage/db';

export interface SaveVocabularyInput {
	word: string;
	lemma: string | null;
	bookId: string;
	bookTitle: string;
	context: string;
	gloss: string;
	pos: string | null;
	gender?: string | null;
}

export async function saveVocabularyWord(input: SaveVocabularyInput): Promise<void> {
	await db.vocabulary.put({
		id: crypto.randomUUID(),
		word: input.word,
		lemma: input.lemma,
		bookId: input.bookId,
		bookTitle: input.bookTitle,
		context: input.context,
		gloss: input.gloss,
		pos: input.pos,
		gender: input.gender ?? null,
		addedAt: Date.now()
	});
}

export async function deleteVocabularyWord(id: string): Promise<void> {
	await db.vocabulary.delete(id);
}
