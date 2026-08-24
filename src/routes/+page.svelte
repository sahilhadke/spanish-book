<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { Book } from '$lib/storage/db';
	import { addBookToLibrary, removeBookFromLibrary, listLibraryBooks, EpubParseError } from '$lib/library/actions';
	import BookCard from '$lib/components/BookCard.svelte';

	let books = $state<Book[]>([]);
	let uploading = $state(false);
	let error = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	async function refresh() {
		books = await listLibraryBooks();
	}

	onMount(refresh);

	async function handleFiles(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		uploading = true;
		error = null;
		try {
			await addBookToLibrary(file);
			await refresh();
		} catch (err) {
			error =
				err instanceof EpubParseError
					? err.message
					: `Something went wrong uploading "${file.name}". Try again.`;
		} finally {
			uploading = false;
		}
	}

	async function handleDelete(book: Book) {
		await removeBookFromLibrary(book);
		await refresh();
	}
</script>

<svelte:head>
	<title>Lectura — Library</title>
</svelte:head>

<div class="page">
	<header class="topbar">
		<span class="brand">Lectura</span>
		<nav>
			<a href="{base}/vocabulary">Vocabulary</a>
		</nav>
	</header>

	<main>
		<div class="toolbar">
			<h1>Your library</h1>
			<button class="upload-btn" onclick={() => fileInput.click()} disabled={uploading}>
				{uploading ? 'Adding book…' : '+ Add EPUB'}
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".epub,application/epub+zip"
				hidden
				onchange={handleFiles}
			/>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		{#if books.length === 0}
			<p class="empty">No books yet. Add a Spanish EPUB to start reading.</p>
		{:else}
			<div class="grid">
				{#each books as book (book.id)}
					<BookCard {book} onDelete={handleDelete} />
				{/each}
			</div>
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
	}
	.topbar nav a {
		font-size: 0.9rem;
		text-decoration: none;
	}
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 4rem;
	}
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	h1 {
		font-family: var(--serif);
		font-size: 1.4rem;
		margin: 0;
	}
	.upload-btn {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 6px;
		padding: 0.55rem 1rem;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
	}
	.upload-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.error {
		background: var(--danger-soft);
		color: var(--danger);
		border-radius: 6px;
		padding: 0.7rem 0.9rem;
		font-size: 0.88rem;
	}
	.empty {
		color: var(--ink-faint);
		text-align: center;
		padding: 3rem 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1.1rem;
	}
</style>
