import type { Editor } from '@tiptap/core';

/**
 * Valheim sign text is Unity rich text where `<size=N>` takes N in *pixels*, and
 * the game auto-scales sign text. This base is therefore an arbitrary, legible
 * choice for the editor's "Normal" (unstyled) text — not Valheim's real base.
 * Keep in sync with the `text-[32px]` class in ../model/editor-context.tsx.
 */
export const BASE_FONT_SIZE = 32;

/** Smallest px the size control allows — below this is unreadable in the editor. */
export const MIN_FONT_SIZE = 8;

/** Largest px the size control allows — above this overflows the sign board. */
export const MAX_FONT_SIZE = 128;

/** Preset sizes shown in the dropdown, ascending. `BASE_FONT_SIZE` (32) is "Normal". */
export const FONT_SIZE_PRESETS: readonly number[] = [12, 16, 20, 24, 28, 32, 40, 48, 64];

/**
 * Round to an integer and clamp to [MIN_FONT_SIZE, MAX_FONT_SIZE]. Non-finite
 * input (NaN, Infinity) falls back to BASE_FONT_SIZE.
 */
export const clampFontSize = (value: number): number => {
    if (!Number.isFinite(value)) {
        return BASE_FONT_SIZE;
    }
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)));
};

/**
 * Parse a CSS font-size string this editor produces (`"32px"` or `"32"`) into a
 * number. Anything else — `null`, empty, non-px units, junk — returns `null`.
 */
export const parseFontSize = (value: string | null | undefined): number | null => {
    if (value == null) {
        return null;
    }
    const match = /^\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*$/.exec(value);
    return match ? Number(match[1]) : null;
};

/** The CSS value stored on the `textStyle` mark for a px size. */
export const formatFontSize = (px: number): string => `${px}px`;

/**
 * The size (px) that applies to the entire current selection, or `null` when the
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
