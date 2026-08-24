// foliate-js ships plain JS with no published types (see node_modules/foliate-js).
// This just satisfies TS module resolution — real typing lives in ./types.ts,
// which callers should use instead of trusting these exports' inferred types.
declare module 'foliate-js/view.js' {
	export function makeBook(file: File | Blob | string): Promise<unknown>;
}
