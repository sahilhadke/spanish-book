import type { FoliateView, FoliateLoadDetail } from '../epub/types';

export interface PageTurnOptions {
	onPrev: () => void;
	onNext: () => void;
}

/**
 * Lets arrow keys turn pages. No click/tap zones — a tap inside the chapter
 * is reserved for text selection (translation lookup), so a page-turn tap
 * there would fight it. Keydown has to be attached inside each chapter's own
 * iframe document too (via the `load` event, same hook selection/controller.ts
 * uses) because key events inside a same-origin iframe never bubble out to
 * the top document — plus one top-level listener for when focus is in the
 * outer chrome (e.g. right after clicking a button).
 */
export function attachPageTurnController(view: FoliateView, opts: PageTurnOptions): () => void {
	const cleanups: Array<() => void> = [];

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
			e.preventDefault();
			opts.onPrev();
		} else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
			e.preventDefault();
			opts.onNext();
		}
	}

	window.addEventListener('keydown', handleKeydown);
	cleanups.push(() => window.removeEventListener('keydown', handleKeydown));

	const onLoad = (e: Event) => {
		const { doc } = (e as CustomEvent<FoliateLoadDetail>).detail;
		doc.addEventListener('keydown', handleKeydown);
		cleanups.push(() => doc.removeEventListener('keydown', handleKeydown));
	};

	view.addEventListener('load', onLoad);
	cleanups.push(() => view.removeEventListener('load', onLoad));

	return () => cleanups.splice(0).forEach((fn) => fn());
}
