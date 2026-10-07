import { normalizeHexColor, TEXT_COLOR_PRESETS } from './text-color';

/** How many custom colors the pickers remember. One row of swatches. */
export const RECENT_COLORS_LIMIT = 8;

const PRESET_HEXES = new Set(TEXT_COLOR_PRESETS.map((preset) => preset.hex));

/**
 * Puts `hex` first in the recent list, without duplicates and capped at
 * `RECENT_COLORS_LIMIT`. Presets are already one click away, so they are not
 * added; the list (same reference) is returned unchanged for them, for invalid
 * input, and when `hex` is already first.
 */
export const addRecentColor = (colors: readonly string[], hex: string): readonly string[] => {
    const normalized = normalizeHexColor(hex);
    if (normalized == null || PRESET_HEXES.has(normalized) || colors[0] === normalized) return colors;
    return [normalized, ...colors.filter((color) => color !== normalized)].slice(0, RECENT_COLORS_LIMIT);
};

/** Reads the stored list, keeping only valid, unique colors. */
export const parseRecentColors = (raw: string | null): readonly string[] => {
    if (!raw) return [];
    try {
        const data: unknown = JSON.parse(raw);
        if (!Array.isArray(data)) return [];
        const colors = data.flatMap((value) => {
            const hex = typeof value === 'string' ? normalizeHexColor(value) : null;
            return hex == null ? [] : [hex];
        });
        return [...new Set(colors)].slice(0, RECENT_COLORS_LIMIT);
    } catch {
        return [];
    }
};
