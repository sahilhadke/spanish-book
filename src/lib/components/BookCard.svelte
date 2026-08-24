<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { Book } from '$lib/storage/db';

	let { book, onDelete }: { book: Book; onDelete: (book: Book) => void } = $props();

	let coverUrl = $derived(book.coverBlob ? URL.createObjectURL(book.coverBlob) : null);

	function open() {
		goto(`${base}/read/${book.id}`);
	}

	function handleDelete() {
		if (confirm(`Remove "${book.title}" from your library? This deletes it from this device.`)) {
			onDelete(book);
		}
	}
</script>

<div class="card">
	<button class="open-btn" onclick={open} aria-label={`Open ${book.title}`}>
		<span class="cover">
			{#if coverUrl}
				<img src={coverUrl} alt="" />
			{:else}
				<span class="cover-fallback">{book.title.slice(0, 1).toUpperCase()}</span>
			{/if}
		</span>
		<span class="meta">
			<span class="title">{book.title}</span>
			{#if book.author}<span class="author">{book.author}</span>{/if}
			{#if book.progressFraction > 0}
				<span class="progress-track"><span class="progress-fill" style="width:{book.progressFraction * 100}%"></span></span>
			{/if}
		</span>
	</button>
	<button class="delete" onclick={handleDelete} aria-label={`Delete ${book.title}`}>✕</button>
</div>

<style>
	.card {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
	}
	.card:hover {
		border-color: var(--line-strong);
	}
	.open-btn {
		display: flex;
		flex-direction: column;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: inherit;
	}
	.cover {
		aspect-ratio: 2 / 3;
		background: var(--surface-alt);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.cover-fallback {
		font-family: var(--serif);
		font-size: 2.5rem;
		color: var(--ink-faint);
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.6rem 0.7rem 0.8rem;
	}
	.title {
		font-size: 0.9rem;
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.author {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.progress-track {
		margin-top: 0.3rem;
		height: 3px;
		border-radius: 2px;
		background: var(--surface-alt);
		overflow: hidden;
	}
	.progress-fill {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.delete {
		position: absolute;
		top: 0.4rem;
		right: 0.4rem;
		width: 1.6rem;
		height: 1.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: none;
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0;
	}
</style>
