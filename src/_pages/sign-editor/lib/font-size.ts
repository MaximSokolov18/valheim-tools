import type { Editor } from '@tiptap/core';

/**
 * Sizes are Valheim `<size=N>` units, not pixels (measured in game, see the sign
 * guide): absolute and linear — 9 is nine fifths the height of 5 — and NOT scaled
 * by the game's auto-fit, which only applies to unsized text and tops out near 8
 * (a lone character). A capital at size 14 spans the board top to bottom.
 */
export const AUTO_FIT_SIZE = 8;

/**
 * Smallest size the game's auto-fit shrinks unsized text to when sized text leaves no room: in game the
 * leftover letters stay readable at about the height of a `<size=2>` glyph instead of vanishing.
 */
export const MIN_AUTO_FIT_SIZE = 2;

/** The board art is laid out at this width (px) when `SIZE_UNIT_PX` applies. */
export const STAGE_WIDTH = 1250;
const STAGE_HEIGHT = STAGE_WIDTH / 2;
/** Width of the text area (66% of the board) at `STAGE_WIDTH`. */
export const STAGE_TEXT_AREA_WIDTH = STAGE_WIDTH * 0.66;
/** Norsebold capital height as a fraction of the font size (735 / 1000 units). */
const CAP_HEIGHT = 0.735;
/** Pixels per `<size>` unit at `STAGE_WIDTH`: a size-14 capital is the board's full height. */
export const SIZE_UNIT_PX = STAGE_HEIGHT / (14 * CAP_HEIGHT);

/** CSS custom property holding the current px-per-unit; set on the text area by the auto-fit hook. */
export const SIZE_UNIT_VAR = '--sign-unit';
/** CSS custom property holding a run's `<size>` number (rendered by the `fontSize` attribute). */
export const SIZE_VALUE_VAR = '--sign-size';

/** CSS font-size for a run of the given game size, resolved against the board's current scale. */
export const sizeToCss = (size: number): string => `calc(${size} * var(${SIZE_UNIT_VAR}))`;

/** Smallest size the control allows (`<size=1>`). */
export const MIN_FONT_SIZE = 1;

/** Largest size the control allows. The game documents no limit; sign mods go up to 9000, so the board shrinks to show it. */
export const MAX_FONT_SIZE = 9000;

/** Preset sizes shown in the dropdown, ascending. A capital at 14 spans the whole board. */
export const FONT_SIZE_PRESETS: readonly number[] = [2, 3, 4, 5, 6, 8, 10, 12, 14, 20, 40, 100];

/**
 * Round to an integer and clamp to [MIN_FONT_SIZE, MAX_FONT_SIZE]. Non-finite
 * input (NaN, Infinity) falls back to AUTO_FIT_SIZE.
 */
export const clampFontSize = (value: number): number => {
    if (!Number.isFinite(value)) {
        return AUTO_FIT_SIZE;
    }
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)));
};

/** Parse a stored size (a plain number string, as `formatFontSize` writes it); anything else is `null`. */
export const parseFontSize = (value: string | null | undefined): number | null => {
    if (value == null) {
        return null;
    }
    return /^\s*\d+(?:\.\d+)?\s*$/.test(value) ? Number(value) : null;
};

/** The value stored on the `textStyle` mark for a game size. */
export const formatFontSize = (size: number): string => String(size);

/**
 * The size (game units) that applies to the entire current selection, or `null` when the
 * selection has no size or mixes sizes — in which case the dropdown shows blank.
 *
 * `getAttributes('textStyle').fontSize` gives the raw size string at one edge of
 * the selection; `isActive('textStyle', { fontSize })` against that same raw
 * value is then what confirms the size covers the whole range (it is false for a
 * partially-sized selection). The raw string is compared as-is to avoid a lossy
 * parse/reformat round-trip.
 */
export const resolveActiveFontSize = (editor: Editor): number | null => {
    const raw = editor.getAttributes('textStyle').fontSize as string | undefined;
    const size = parseFontSize(raw);
    if (size == null) {
        return null;
    }
    return editor.isActive('textStyle', { fontSize: raw }) ? size : null;
};
