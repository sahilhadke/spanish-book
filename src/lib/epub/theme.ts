export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderStyle {
	theme: ReaderTheme;
	fontSize: number; // percent, e.g. 100
	lineHeight: number; // e.g. 1.5
}

export const defaultReaderStyle: ReaderStyle = { theme: 'light', fontSize: 100, lineHeight: 1.5 };

export const readerPalettes: Record<ReaderTheme, { bg: string; ink: string }> = {
	light: { bg: '#f6f5f1', ink: '#22201c' },
	dark: { bg: '#17181a', ink: '#edeae2' },
	sepia: { bg: '#f2e8d5', ink: '#3a2e1f' }
};

/** Passed to foliate-js's Paginator.setStyles() — see node_modules/foliate-js/reader.js getCSS() for the reference pattern this follows. */
export function buildReaderCSS({ theme, fontSize, lineHeight }: ReaderStyle): string {
	const { bg, ink } = readerPalettes[theme];
	return `
		html {
			font-size: ${fontSize}%;
		}
		html, body {
			background: ${bg} !important;
			color: ${ink} !important;
		}
		p, li, blockquote, dd {
			line-height: ${lineHeight};
			text-align: start;
			hyphens: auto;
			-webkit-hyphens: auto;
		}
		a { color: ${theme === 'light' ? '#0d6e6e' : '#57d6c7'} !important; }
	`;
}
