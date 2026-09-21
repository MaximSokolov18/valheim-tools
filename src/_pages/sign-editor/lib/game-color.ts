import { normalizeHexColor } from './text-color';

/** One output channel's coefficients: `[rIn, gIn, bIn, offset]`, all in the 0-1 range. */
type MatrixRow = readonly [number, number, number, number];

/**
 * RGB->RGB affine color matrix approximating how Valheim actually renders
 * sign text color, fit by least-squares regression against 13 known
 * (source hex, in-game rendered color) pairs sampled from a reference
 * screenshot of all 16 standard sign colors in one consistently-lit scene
 * (see docs/superpowers/specs/2026-09-19-realistic-ingame-color-preview-design.md).
 *
 * A uniform "darken + desaturate + rotate hue" model (this file's previous
 * approach) does not fit the data: the blue channel is suppressed more than
 * red (e.g. full-brightness blue ends up far darker than full-brightness
 * red or yellow), and fully neutral colors (white/silver/grey) pick up a
 * warm rose tint in-game rather than staying gray — behavior only a
 * per-channel matrix (not a hue/saturation/value scale, which by
 * construction can never move a neutral color off the gray axis) can
 * reproduce. This is still a fixed approximation, not an exact conversion:
 * Valheim has no public LUT/formula for this, actual brightness depends on
 * ambient in-game lighting, and 3 of the 16 reference colors (brown,
 * maroon, grey) were too close to the wood background to sample reliably
 * and were excluded from the fit (though the fitted matrix still produces
 * a reasonable estimate for them).
 */
export const GAME_COLOR_MATRIX: readonly [MatrixRow, MatrixRow, MatrixRow] = [
    [0.7274, 0.0556, -0.0087, -0.0189],
    [0.0041, 0.5329, 0.0361, -0.0103],
    [0.1155, 0.1292, 0.4692, -0.1202],
];

/**
 * The same matrix, formatted as an SVG `feColorMatrix` `values` attribute
 * (5 columns per row - R/G/B/A input coefficients plus a constant offset -
 * one row per output channel, alpha passed through unchanged). Requires
 * `color-interpolation-filters="sRGB"` on the `<filter>`/`<feColorMatrix>`
 * element, since the matrix was fit against plain (gamma-encoded) sRGB
 * values, not the SVG default of linearRGB.
 */
export const GAME_COLOR_MATRIX_VALUES = `${GAME_COLOR_MATRIX.map(([r, g, b, offset]) => `${r} ${g} ${b} 0 ${offset}`).join(' ')} 0 0 0 1 0`;

/** Id of the `<filter>` element `Board` renders `GAME_COLOR_MATRIX_VALUES` into. */
export const GAME_COLOR_FILTER_ID = 'sign-editor-game-color-filter';

/** CSS `filter` value referencing that `<filter>` element. */
export const GAME_COLOR_FILTER = `url(#${GAME_COLOR_FILTER_ID})`;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const applyChannel = (row: MatrixRow, r: number, g: number, b: number): string =>
    Math.round(clamp01(row[0] * r + row[1] * g + row[2] * b + row[3]) * 255)
        .toString(16)
        .padStart(2, '0');

/**
 * Approximates how `hex` renders on an in-game Valheim sign, using the same
 * matrix as `GAME_COLOR_FILTER`. Invalid input falls back to black, same
 * fallback `normalizeHexColor` uses elsewhere.
 */
export const toGameColor = (hex: string): string => {
    const normalized = normalizeHexColor(hex) ?? '#000000';
    const r = parseInt(normalized.slice(1, 3), 16) / 255;
    const g = parseInt(normalized.slice(3, 5), 16) / 255;
    const b = parseInt(normalized.slice(5, 7), 16) / 255;
    const [rRow, gRow, bRow] = GAME_COLOR_MATRIX;
    return `#${applyChannel(rRow, r, g, b)}${applyChannel(gRow, r, g, b)}${applyChannel(bRow, r, g, b)}`;
};
