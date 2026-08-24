/**
 * A selection Range's own getBoundingClientRect() is relative to the
 * chapter iframe's viewport, not the top page — foliate-js renders each
 * chapter inside a same-origin (blob:) iframe (see node_modules/foliate-js/paginator.js).
 * Add the iframe's own page-relative rect to translate into page coordinates
 * that Floating UI (running in the top document) can anchor to.
 */
export function getSelectionRectInPage(iframeDoc: Document, range: Range): DOMRect | null {
	const iframeEl = iframeDoc.defaultView?.frameElement as HTMLIFrameElement | null;
	if (!iframeEl) return null;

	const rangeRect = range.getBoundingClientRect();
	if (rangeRect.width === 0 && rangeRect.height === 0) return null;

	const iframeRect = iframeEl.getBoundingClientRect();
	return new DOMRect(
		iframeRect.left + rangeRect.left,
		iframeRect.top + rangeRect.top,
		rangeRect.width,
		rangeRect.height
	);
}
