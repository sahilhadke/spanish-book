// Everything in this app reads from IndexedDB/OPFS in the browser — there is
// no server to render against, and book data can't be known at build time.
export const ssr = false;
export const prerender = false;
