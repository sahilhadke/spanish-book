<script lang="ts">
	import { computePosition, offset, flip, shift, autoUpdate, type VirtualElement } from '@floating-ui/dom';
	import type { SelectionInfo } from '$lib/selection/controller';
	import { lookup, type LookupResult } from '$lib/lookup';
	import { saveVocabularyWord } from '$lib/vocabulary/actions';

	let {
		selection,
		bookId,
		bookTitle
	}: {
		selection: SelectionInfo | null;
		bookId: string;
		bookTitle: string;
	} = $props();

	let popupEl = $state<HTMLDivElement>();
	let x = $state(0);
	let y = $state(0);
	let loading = $state(false);
	let result = $state<LookupResult | null>(null);
	let saved = $state(false);
	let requestId = 0;

	$effect(() => {
		const sel = selection;
		if (!sel) {
			result = null;
			return;
		}
		const id = ++requestId;
		loading = true;
		result = null;
		saved = false;
		lookup(sel.text).then((r) => {
			if (id === requestId) {
				result = r;
				loading = false;
			}
		});
	});

	$effect(() => {
		const sel = selection;
		const el = popupEl;
		if (!sel || !el) return;

		const virtualEl: VirtualElement = { getBoundingClientRect: () => sel.rect };
		const stop = autoUpdate(virtualEl, el, () => {
			computePosition(virtualEl, el, {
				placement: 'top',
				middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })]
			}).then(({ x: px, y: py }) => {
				x = px;
				y = py;
			});
		});
		return stop;
	});

	function describeAnalysis(a: NonNullable<LookupResult['conjugation']>[number]): string {
		if (a.mood === 'infinitive') return 'infinitive';
		if (a.isParticiple) return `past participle of ${a.infinitive}`;
		const person = { first: '1st', second: '2nd', third: '3rd' }[a.person] ?? a.person;
		return `${a.infinitive} — ${a.mood} ${a.tense}, ${person} ${a.number}`;
	}

	async function handleSave() {
		if (!selection) return;
		const r = result;
		await saveVocabularyWord({
			word: selection.text,
			lemma: r?.lemma ?? null,
			bookId,
			bookTitle,
			context: selection.context,
			gloss: r?.dictionary?.senses[0]?.definition ?? '',
			pos: r?.dictionary?.senses[0]?.partOfSpeech ?? null
		});
		saved = true;
	}
</script>

{#if selection}
	<div bind:this={popupEl} class="popup" style="left:{x}px; top:{y}px;" role="dialog" aria-label="Word lookup">
		<div class="word-row">
			<strong class="word">{selection.text}</strong>
			{#if result?.lemma && result.lemma !== selection.text.toLowerCase()}
				<span class="lemma">→ {result.lemma}</span>
			{/if}
		</div>

		{#if loading}
			<p class="status">Looking up…</p>
		{:else if result?.isPhrase}
			<p class="status">Select a single word for an instant dictionary lookup.</p>
		{:else if result}
			{#if result.conjugation?.length}
				<ul class="conjugation">
					{#each result.conjugation as a (a.infinitive + a.mood + a.tense + a.person + a.number)}
						<li>{describeAnalysis(a)}</li>
					{/each}
				</ul>
			{/if}
			{#if result.dictionary}
				<ul class="senses">
					{#each result.dictionary.senses as sense, i (i)}
						<li>
							{#if sense.partOfSpeech}<span class="pos">{sense.partOfSpeech}</span>{/if}
							{sense.definition}
						</li>
					{/each}
				</ul>
			{:else if !result.conjugation?.length}
				<p class="status">No definition found — this word may not be in Wiktionary, or you're offline.</p>
			{/if}
			<button class="save-btn" onclick={handleSave} disabled={saved}>
				{saved ? '✓ Saved' : '+ Save to vocabulary'}
			</button>
		{/if}
	</div>
{/if}

<style>
	.popup {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 50;
		width: min(300px, 86vw);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 10px;
		box-shadow: var(--shadow);
		padding: 0.7rem 0.85rem 0.8rem;
		font-size: 0.86rem;
	}
	.word-row {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin-bottom: 0.3rem;
	}
	.word {
		font-size: 1rem;
	}
	.lemma {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.status {
		color: var(--ink-faint);
		margin: 0.3rem 0;
	}
	.conjugation {
		list-style: none;
		margin: 0 0 0.4rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.conjugation li {
		color: var(--accent);
		font-size: 0.8rem;
	}
	.senses {
		list-style: none;
		margin: 0 0 0.6rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.senses li {
		line-height: 1.4;
	}
	.pos {
		display: inline-block;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0.03em 0.35em;
		margin-right: 0.3em;
	}
	.save-btn {
		width: 100%;
		background: var(--accent-soft);
		color: var(--accent);
		border: 1px solid var(--accent-soft-border);
		border-radius: 6px;
		padding: 0.4rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}
	.save-btn:disabled {
		cursor: default;
	}
</style>
