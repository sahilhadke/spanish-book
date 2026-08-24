<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegisterError(error: unknown) {
			console.error('Service worker registration failed', error);
		}
	});
</script>

{#if $needRefresh}
	<div class="toast">
		<span>An update is ready.</span>
		<button onclick={() => updateServiceWorker(true)}>Reload</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		background: var(--ink);
		color: var(--bg);
		border-radius: 8px;
		padding: 0.6rem 0.7rem 0.6rem 1rem;
		box-shadow: var(--shadow);
		font-size: 0.85rem;
	}
	.toast button {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}
</style>
