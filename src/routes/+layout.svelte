<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import UpdateToast from '$lib/components/UpdateToast.svelte';
	import IosInstallHint from '$lib/components/IosInstallHint.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<IosInstallHint />
{@render children()}
<UpdateToast />
