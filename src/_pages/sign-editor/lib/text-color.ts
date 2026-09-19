import type { Editor } from '@tiptap/core';

/** Preset swatches shown in the picker, standard web colors. */
export const TEXT_COLOR_PRESETS: readonly { label: string; hex: string }[] = [
    { label: 'Black', hex: '#000000' },
    { label: 'White', hex: '#ffffff' },
    { label: 'Red', hex: '#e53935' },
    { label: 'Orange', hex: '#fb8c00' },
    { label: 'Yellow', hex: '#fdd835' },
    { label: 'Green', hex: '#43a047' },
    { label: 'Blue', hex: '#1e88e5' },
    { label: 'Purple', hex: '#8e24aa' },
];

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** `true` for a `#rgb` or `#rrggbb` string (case-insensitive), else `false`. */
export const isValidHexColor = (value: string): boolean => HEX_COLOR_PATTERN.test(value);

/**
 * Normalize a hex color string to lowercase 6-digit form (`#rrggbb`).
 * `#abc` -> `#aabbcc`; `#AABBCC` -> `#aabbcc`; invalid input -> `null`.
 */
export const normalizeHexColor = (value: string): string | null => {
    if (!isValidHexColor(value)) {
        return null;
    }
    const hex = value.slice(1).toLowerCase();
    const expanded =
        hex.length === 3
            ? hex
                  .split('')
                  .map((channel) => channel + channel)
                  .join('')
            : hex;
    return `#${expanded}`;
};

/**
 * The color that applies to the entire current selection, or `null` when the
 * selection has no color or mixes colors — in which case the picker shows a
 * "no color" trigger state.
 *
 * `getAttributes('textStyle').color` gives the raw color string at one edge of
 * the selection; `isActive('textStyle', { color })` against that same raw
 * value is then what confirms the color covers the whole range (it is false
 * for a partially-colored selection). The raw string is compared as-is (like
 * `resolveActiveFontSize`) to avoid a lossy parse/reformat round-trip, while
 * the returned value is normalized for display.
 */
export const resolveActiveColor = (editor: Editor): string | null => {
    const raw = editor.getAttributes('textStyle').color as string | undefined;
    const normalized = raw == null ? null : normalizeHexColor(raw);
    if (normalized == null) {
        return null;
    }
    return editor.isActive('textStyle', { color: raw }) ? normalized : null;
};
