// Dev-only: a minimal static server that replicates GitHub Pages' actual
// behavior — serve real files as-is; for any path that doesn't match a real
// file, respond with 404.html's content at a 404 status. `vite preview`
// routes unmatched paths through SvelteKit's own router (not a literal
// static-file lookup) and `serve` shows a directory listing / generic 404,
// so neither faithfully reproduces this for verifying the SPA-fallback +
// offline service-worker behavior. Run with: node scripts/gh-pages-sim-server.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'build');
const port = Number(process.argv[2]) || 5192;

const mime = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.webmanifest': 'application/manifest+json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2'
};

createServer(async (req, res) => {
	const urlPath = decodeURIComponent(req.url.split('?')[0]);
	const filePath = join(root, urlPath);
	try {
		const s = await stat(filePath);
		if (s.isFile()) {
			const body = await readFile(filePath);
			res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
			res.end(body);
			return;
		}
	} catch {
		// fall through to 404.html
	}
	const notFound = await readFile(join(root, '404.html'));
	res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
	res.end(notFound);
}).listen(port, () => console.log(`GitHub-Pages-style static server on http://localhost:${port}`));
