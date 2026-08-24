<script lang="ts">
	let show = $state(false);

	$effect(() => {
		const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
		const nav = navigator as Navigator & { standalone?: boolean };
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
		const dismissed = localStorage.getItem('lectura-ios-hint-dismissed') === '1';
		show = isIos && !isStandalone && !dismissed;
	});

	function dismiss() {
		show = false;
		localStorage.setItem('lectura-ios-hint-dismissed', '1');
	}
</script>

{#if show}
	<div class="hint">
		<p>
			For offline reading and safer storage on iPhone/iPad, add Lectura to your Home Screen: tap
			<strong>Share</strong> → <strong>Add to Home Screen</strong>.
		</p>
		<button onclick={dismiss} aria-label="Dismiss">✕</button>
	</div>
{/if}

<style>
	.hint {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--accent-soft);
		color: var(--ink);
		border-bottom: 1px solid var(--accent-soft-border);
		padding: 0.55rem 0.9rem;
		font-size: 0.8rem;
	}
	.hint p {
		margin: 0;
		flex: 1;
	}
	.hint button {
		background: none;
		border: none;
		font-size: 0.85rem;
		cursor: pointer;
		color: var(--ink-soft);
		flex-shrink: 0;
	}
</style>
