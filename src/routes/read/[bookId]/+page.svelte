<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { db, type Book } from '$lib/storage/db';
	import { loadBookFile } from '$lib/storage/opfs';
	import { attachSelectionController, type SelectionInfo } from '$lib/selection/controller';
	import { attachPageTurnController } from '$lib/reader/pageTurn';
	import SelectionPopup from '$lib/components/SelectionPopup.svelte';
	import { defaultReaderStyle, buildReaderCSS, readerPalettes, type ReaderStyle, type ReaderTheme } from '$lib/epub/theme';
	import type { FoliateView, FoliateRelocateDetail, FoliateTocItem } from '$lib/epub/types';

	const bookId = page.params.bookId as string;

	let book = $state<Book | null | undefined>(undefined); // undefined = loading, null = not found
	let container = $state<HTMLDivElement>();
	let view: FoliateView | null = null;
	let detachSelection: (() => void) | null = null;
	let detachPageTurn: (() => void) | null = null;
	let selection = $state<SelectionInfo | null>(null);
	let progressFraction = $state(0);
	let toc = $state<FoliateTocItem[]>([]);
	let tocOpen = $state(false);
	let settingsOpen = $state(false);
	let readerStyle = $state<ReaderStyle>({ ...defaultReaderStyle });
	let loadError = $state<string | null>(null);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingLocation: { cfi: string; fraction: number } | null = null;

	$effect(() => {
		let cancelled = false;
		(async () => {
			const found = await db.books.get(bookId);
			if (cancelled) return;
			book = found ?? null;
			if (!found) return;

			const savedStyle = await db.settings.get('readerStyle');
			if (!cancelled && savedStyle?.value) readerStyle = { ...defaultReaderStyle, ...(savedStyle.value as Partial<ReaderStyle>) };

			try {
				const file = await loadBookFile(found.id, found.usesOpfs);
				if (cancelled) return;
				await mountReader(found, file);
			} catch (err) {
				loadError = `Couldn't open this book: ${err instanceof Error ? err.message : 'unknown error'}`;
			}
		})();
		return () => {
			cancelled = true;
		};
	});

	async function mountReader(b: Book, file: File | Blob) {
		await import('foliate-js/view.js');
		const el = document.createElement('foliate-view') as unknown as FoliateView;
		container?.appendChild(el);
		view = el;

		await el.open(file);
		toc = el.book.toc ?? [];
		applyStyle();

		el.addEventListener('relocate', (e: Event) => {
			const detail = (e as CustomEvent<FoliateRelocateDetail>).detail;
			progressFraction = detail.fraction ?? 0;
			pendingLocation = { cfi: detail.cfi, fraction: detail.fraction ?? 0 };
			if (saveTimer) clearTimeout(saveTimer);
			saveTimer = setTimeout(flushProgress, 800);
		});

		detachSelection = attachSelectionController(el, {
			onSelect: (info) => (selection = info),
			onClear: () => (selection = null)
		});

		detachPageTurn = attachPageTurnController(el, {
			onPrev: () => view?.prev(),
			onNext: () => view?.next()
		});

		await el.init({ lastLocation: b.lastCfi ?? undefined, showTextStart: !b.lastCfi });
		await db.books.update(b.id, { lastOpenedAt: Date.now() });
	}

	function applyStyle() {
		const renderer = (view as unknown as { renderer?: { setStyles?: (css: string) => void } })?.renderer;
		renderer?.setStyles?.(buildReaderCSS(readerStyle));
	}

	async function flushProgress() {
		if (!pendingLocation || !book) return;
		const loc = pendingLocation;
		pendingLocation = null;
		await db.books.update(book.id, { lastCfi: loc.cfi, progressFraction: loc.fraction });
	}

	function persistReaderStyle() {
		// readerStyle is a $state proxy — IndexedDB's structured clone can't
		// serialize that directly, so snapshot it to a plain object first.
		db.settings.put({ key: 'readerStyle', value: $state.snapshot(readerStyle) });
	}

	function setTheme(theme: ReaderTheme) {
		readerStyle = { ...readerStyle, theme };
		applyStyle();
		persistReaderStyle();
	}

	function changeFontSize(delta: number) {
		readerStyle = { ...readerStyle, fontSize: Math.min(180, Math.max(70, readerStyle.fontSize + delta)) };
		applyStyle();
		persistReaderStyle();
	}

	function goToTocItem(item: FoliateTocItem) {
		view?.goTo(item.href);
		tocOpen = false;
	}

	$effect(() => {
		function handleOutsidePointerDown(e: PointerEvent) {
			const target = e.target as HTMLElement;
			if (target.closest('.popup') || target.closest('.chrome-panel')) return;
			if (target.closest('.reader-surface')) return; // let the iframe's own selectionchange handle it
			selection = null;
		}
		window.addEventListener('pointerdown', handleOutsidePointerDown);
		return () => window.removeEventListener('pointerdown', handleOutsidePointerDown);
	});

	onDestroy(() => {
		detachSelection?.();
		detachPageTurn?.();
		if (saveTimer) clearTimeout(saveTimer);
		flushProgress();
	});
</script>

<svelte:head>
	<title>{book?.title ?? 'Lectura'}</title>
</svelte:head>

<div class="reader-page">
	<header class="topbar">
		<a class="back" href="{base}/">← Library</a>
		<span class="progress-label">{Math.round(progressFraction * 100)}%</span>
		<div class="actions">
			<button onclick={() => { tocOpen = !tocOpen; settingsOpen = false; }}>Contents</button>
			<button onclick={() => { settingsOpen = !settingsOpen; tocOpen = false; }}>Aa</button>
		</div>
	</header>

	{#if tocOpen}
		<nav class="chrome-panel toc-panel" aria-label="Table of contents">
			<ul>
				{#each toc as item (item.href)}
					<li><button onclick={() => goToTocItem(item)}>{item.label}</button></li>
				{/each}
			</ul>
		</nav>
	{/if}

	{#if settingsOpen}
		<div class="chrome-panel settings-panel">
			<div class="row">
				<span>Theme</span>
				<div class="theme-buttons">
					<button class:active={readerStyle.theme === 'light'} onclick={() => setTheme('light')}>Light</button>
					<button class:active={readerStyle.theme === 'sepia'} onclick={() => setTheme('sepia')}>Sepia</button>
					<button class:active={readerStyle.theme === 'dark'} onclick={() => setTheme('dark')}>Dark</button>
				</div>
			</div>
			<div class="row">
				<span>Text size</span>
				<div class="size-buttons">
					<button onclick={() => changeFontSize(-10)} aria-label="Decrease text size">A−</button>
					<button onclick={() => changeFontSize(10)} aria-label="Increase text size">A+</button>
				</div>
			</div>
		</div>
	{/if}

	{#if book === undefined}
		<p class="status">Loading…</p>
	{:else if book === null}
		<p class="status">Book not found. <a href="{base}/">Back to library</a></p>
	{:else if loadError}
		<p class="status error">{loadError}</p>
	{/if}

	<div class="reader-surface" style="background:{readerPalettes[readerStyle.theme].bg}" bind:this={container}>
		{#if book}
			<button class="page-nav prev" onclick={() => view?.prev()} aria-label="Previous page">‹</button>
			<button class="page-nav next" onclick={() => view?.next()} aria-label="Next page">›</button>
		{/if}
	</div>

	<SelectionPopup {selection} bookId={book?.id ?? ''} bookTitle={book?.title ?? ''} />
</div>

<style>
	.reader-page {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--bg);
	}
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.6rem 0.9rem;
		border-bottom: 1px solid var(--line);
		font-size: 0.85rem;
	}
	.back {
		text-decoration: none;
		color: var(--ink-soft);
	}
	.progress-label {
		color: var(--ink-faint);
		font-variant-numeric: tabular-nums;
	}
	.actions {
		display: flex;
		gap: 0.4rem;
	}
	.actions button {
		background: var(--surface-alt);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 0.35rem 0.6rem;
		font-size: 0.8rem;
		cursor: pointer;
		color: var(--ink);
	}
	.chrome-panel {
		position: absolute;
		top: 3rem;
		right: 0.9rem;
		z-index: 40;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		box-shadow: var(--shadow);
		padding: 0.8rem;
		font-size: 0.85rem;
		max-height: 70dvh;
		overflow-y: auto;
	}
	.toc-panel {
		width: min(320px, 80vw);
	}
	.toc-panel ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.toc-panel button {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.4rem 0.2rem;
		font-size: 0.85rem;
		cursor: pointer;
		color: var(--ink);
	}
	.toc-panel button:hover {
		color: var(--accent);
	}
	.settings-panel {
		width: min(280px, 80vw);
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.theme-buttons,
	.size-buttons {
		display: flex;
		gap: 0.3rem;
	}
	.theme-buttons button,
	.size-buttons button {
		background: var(--surface-alt);
		border: 1px solid var(--line);
		border-radius: 5px;
		padding: 0.3rem 0.55rem;
		font-size: 0.78rem;
		cursor: pointer;
		color: var(--ink);
	}
	.theme-buttons button.active {
		border-color: var(--accent);
		color: var(--accent);
	}
	.status {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--ink-faint);
	}
	.status.error {
		color: var(--danger);
	}
	.reader-surface {
		position: relative;
		flex: 1;
		min-height: 0;
	}
	.reader-surface :global(foliate-view) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.page-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 30;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-soft);
		font-size: 1.4rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0.35;
		transition: opacity 0.15s ease;
	}
	.page-nav:hover,
	.page-nav:focus-visible {
		opacity: 1;
	}
	.page-nav.prev {
		left: 0.5rem;
	}
	.page-nav.next {
		right: 0.5rem;
	}
</style>
