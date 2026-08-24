import type { FoliateView, FoliateLoadDetail } from '../epub/types';
import { getSelectionRectInPage } from './resolve';
import { extractSentenceContext } from './context';

export interface SelectionInfo {
	text: string;
	context: string;
	rect: DOMRect;
}

export interface SelectionControllerOptions {
	onSelect: (info: SelectionInfo) => void;
	onClear: () => void;
	/** debounce so a mid-drag selection doesn't spawn a popup per character */
	debounceMs?: number;
}

/**
 * Wires up tap/long-press-to-select inside foliate-js's per-chapter iframe.
 * foliate-js re-emits the chapter iframe's `load` event on the <foliate-view>
 * element itself with { doc, index } (see node_modules/foliate-js/view.js
 * #onLoad) — that's the hook this attaches to, since `document.getSelection()`
 * on the TOP document never sees a same-origin iframe's internal selection;
 * you have to ask the iframe's own document for it.
 */
export function attachSelectionController(view: FoliateView, opts: SelectionControllerOptions): () => void {
	const debounceMs = opts.debounceMs ?? 300;
	const cleanups: Array<() => void> = [];

	const onLoad = (e: Event) => {
		const { doc } = (e as CustomEvent<FoliateLoadDetail>).detail;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const handleSelectionChange = () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				const sel = doc.getSelection();
				if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
					opts.onClear();
					return;
				}
				const text = sel.toString().trim();
				if (!text) {
					opts.onClear();
					return;
				}
				const range = sel.getRangeAt(0);
				const rect = getSelectionRectInPage(doc, range);
				if (!rect) {
					opts.onClear();
					return;
				}
				opts.onSelect({ text, context: extractSentenceContext(range), rect });
			}, debounceMs);
		};

		doc.addEventListener('selectionchange', handleSelectionChange);
		cleanups.push(() => {
			if (timer) clearTimeout(timer);
			doc.removeEventListener('selectionchange', handleSelectionChange);
		});
	};

	view.addEventListener('load', onLoad);
	cleanups.push(() => view.removeEventListener('load', onLoad));

	return () => cleanups.splice(0).forEach((fn) => fn());
}
