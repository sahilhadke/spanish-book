/** Extracts the sentence containing the selection, walking up from the closest text-bearing block. Heuristic, not a formal parse — good enough to give a lookup (and, later, an AI call) surrounding context. */
export function extractSentenceContext(range: Range): string {
	const selectedText = range.toString();
	try {
		let node: Node | null = range.commonAncestorContainer;
		let el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
		while (el && (el.textContent?.trim().length ?? 0) < 20 && el.parentElement) {
			el = el.parentElement;
		}
		const blockText = el?.textContent ?? '';
		if (!blockText || typeof Intl.Segmenter === 'undefined') return selectedText;

		const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
		const idx = blockText.indexOf(selectedText);
		if (idx === -1) return selectedText;

		for (const seg of segmenter.segment(blockText)) {
			if (seg.index <= idx && idx < seg.index + seg.segment.length) return seg.segment.trim();
		}
		return selectedText;
	} catch {
		return selectedText;
	}
}
