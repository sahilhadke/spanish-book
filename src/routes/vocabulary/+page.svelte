<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { db, type VocabularyEntry } from '$lib/storage/db';
	import { deleteVocabularyWord } from '$lib/vocabulary/actions';

	let entries = $state<VocabularyEntry[]>([]);

	async function refresh() {
		entries = await db.vocabulary.orderBy('addedAt').reverse().toArray();
	}

	onMount(refresh);

	async function handleDelete(id: string) {
		await deleteVocabularyWord(id);
		await refresh();
	}
</script>

<svelte:head>
	<title>Lectura — Vocabulary</title>
</svelte:head>

<div class="page">
	<header class="topbar">
		<a class="brand" href="{base}/">Lectura</a>
		<span class="count">{entries.length} saved</span>
	</header>

	<main>
		<h1>Vocabulary</h1>
		{#if entries.length === 0}
			<p class="empty">Words you save while reading show up here.</p>
		{:else}
			<ul class="list">
				{#each entries as entry (entry.id)}
					<li class="entry">
						<div class="entry-main">
							<span class="word">{entry.word}</span>
							{#if entry.lemma && entry.lemma !== entry.word.toLowerCase()}
								<span class="lemma">→ {entry.lemma}</span>
							{/if}
							{#if entry.pos}<span class="pos">{entry.pos}</span>{/if}
						</div>
						{#if entry.gloss}<p class="gloss">{entry.gloss}</p>{/if}
						{#if entry.context}<p class="context">“{entry.context}”</p>{/if}
						<div class="entry-footer">
							<span class="source">{entry.bookTitle}</span>
							<button class="delete" onclick={() => handleDelete(entry.id)}>Remove</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
</div>

<style>
	.page {
		min-height: 100dvh;
	}
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid var(--line);
	}
	.brand {
		font-family: var(--serif);
		font-weight: 700;
		font-size: 1.15rem;
		text-decoration: none;
		color: var(--ink);
	}
	.count {
		font-size: 0.82rem;
		color: var(--ink-faint);
	}
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 4rem;
	}
	h1 {
		font-family: var(--serif);
		font-size: 1.4rem;
		margin: 0 0 1.2rem;
	}
	.empty {
		color: var(--ink-faint);
		text-align: center;
		padding: 3rem 1rem;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.entry {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 0.8rem 1rem;
	}
	.entry-main {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.word {
		font-size: 1.05rem;
		font-weight: 600;
	}
	.lemma {
		color: var(--ink-faint);
		font-size: 0.82rem;
	}
	.pos {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0.03em 0.35em;
	}
	.gloss {
		margin: 0.3rem 0 0;
		font-size: 0.88rem;
	}
	.context {
		margin: 0.3rem 0 0;
		font-size: 0.82rem;
		color: var(--ink-faint);
		font-style: italic;
	}
	.entry-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.5rem;
	}
	.source {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
	.delete {
		background: none;
		border: none;
		color: var(--danger);
		font-size: 0.78rem;
		cursor: pointer;
		padding: 0;
	}
</style>
