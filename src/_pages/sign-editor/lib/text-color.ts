import type { Editor } from '@tiptap/core';

/** Preset swatches shown in the picker, standard web colors. */
export const TEXT_COLOR_PRESETS: readonly { label: string; hex: string }[] = [
    { label: 'Red', hex: '#ff0000' },
    { label: 'Cyan', hex: '#00ffff' },
    { label: 'Green', hex: '#00ff00' },
    { label: 'Yellow', hex: '#ffff00' },
    { label: 'Orange', hex: '#ffa500' },
    { label: 'Magenta', hex: '#ff00ff' },
    { label: 'White', hex: '#ffffff' },
    { label: 'Blue', hex: '#0000ff' },
];

/** The color a sign's text has until the user explicitly picks another one. */
export const DEFAULT_TEXT_COLOR = '#000000';

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
 * Shortens a normalized `#rrggbb` hex to `#rgb` when every channel's two
 * digits match (`#ff66ff` -> `#f6f`), saving 3 characters toward
 * `SIGN_CHAR_LIMIT` in the sign markup. Returns the input unchanged when a
 * channel's digits differ, since the shorthand can't represent it.
 */
export const shortenHexColor = (hex: string): string => {
    const [r1, r2, g1, g2, b1, b2] = hex.slice(1);
    if (r1 !== r2 || g1 !== g2 || b1 !== b2) {
        return hex;
    }
    return `#${r1}${g1}${b1}`;
};

/**
 * The color that applies to the entire current selection: the explicit color
 * when the whole selection shares one, `DEFAULT_TEXT_COLOR` when none of the
 * selection has an explicit color, or `null` when the selection mixes colors
 * — in which case the picker shows a "no color" trigger state.
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
    if (raw == null) {
        return DEFAULT_TEXT_COLOR;
    }
    const normalized = normalizeHexColor(raw);
    if (normalized == null) {
        return DEFAULT_TEXT_COLOR;
    }
    return editor.isActive('textStyle', { color: raw }) ? normalized : null;
};
