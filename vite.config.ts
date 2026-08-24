import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '404.html' })
			// When a GitHub repo/Pages target is picked, set `paths: { base: '/<repo-name>' }`
			// here (SvelteKit owns `base`, not Vite's own `base` option — it overrides it).
		}),
		SvelteKitPWA({
			kit: { adapterFallback: '404.html', spa: true },
			registerType: 'prompt',
			injectRegister: false,
			manifest: {
				name: 'Lectura',
				short_name: 'Lectura',
				description: 'Read Spanish EPUBs with tap-to-translate word and grammar help.',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#F6F5F1',
				theme_color: '#0D6E6E',
				icons: [
					{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{ src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/en\.wiktionary\.org\/api\/rest_v1\/page\/definition\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'dictionary-cache',
							expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
			},
			devOptions: { enabled: false }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
