// foliate-js ships as plain JS with no published types. These cover only the
// surface area this app actually uses — see node_modules/foliate-js/view.js
// for the full implementation.

export interface FoliateTocItem {
	label: string;
	href: string;
	subitems?: FoliateTocItem[];
}

export interface FoliateBook {
	metadata?: {
		title?: string | Record<string, string>;
		author?: unknown;
		language?: string | string[];
	};
	toc?: FoliateTocItem[];
	getCover?: () => Promise<Blob | null> | Blob | null;
}

export interface FoliateRelocateDetail {
	cfi: string;
	range?: Range;
	fraction: number;
	tocItem?: FoliateTocItem | null;
}

export interface FoliateLoadDetail {
	doc: Document;
	index: number;
}

export interface FoliateView extends HTMLElement {
	open(file: File | Blob | FoliateBook): Promise<void>;
	init(opts: { lastLocation?: string | null; showTextStart?: boolean }): Promise<void>;
	goTo(target: string | number): Promise<void> | void;
	next(): Promise<void> | void;
	prev(): Promise<void> | void;
	readonly book: FoliateBook;
	lastLocation?: FoliateRelocateDetail;
}
