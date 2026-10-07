import { describe, expect, it } from 'vitest';
import { addRecentColor, parseRecentColors, RECENT_COLORS_LIMIT } from '../recent-colors';

describe('addRecentColor', () => {
    it('puts the newest color first without duplicates', () => {
        expect(addRecentColor(['#112233', '#445566'], '#445566')).toEqual(['#445566', '#112233']);
        expect(addRecentColor([], '#ABC')).toEqual(['#aabbcc']);
    });

    it('keeps the list short', () => {
        const full = Array.from({ length: RECENT_COLORS_LIMIT }, (_, i) => `#00000${i}`);
        const next = addRecentColor(full, '#123456');
        expect(next).toHaveLength(RECENT_COLORS_LIMIT);
        expect(next[0]).toBe('#123456');
        expect(next).not.toContain(full[RECENT_COLORS_LIMIT - 1]);
    });

    it('returns the same list for presets, invalid input and the current first color', () => {
        const colors = ['#123456'];
        expect(addRecentColor(colors, '#ff0000')).toBe(colors);
        expect(addRecentColor(colors, 'nope')).toBe(colors);
        expect(addRecentColor(colors, '#123456')).toBe(colors);
    });
});

describe('parseRecentColors', () => {
    it('keeps valid unique colors and drops the rest', () => {
        expect(parseRecentColors(JSON.stringify(['#ABCDEF', 'x', 3, '#abcdef', '#fff']))).toEqual(['#abcdef', '#ffffff']);
        expect(parseRecentColors('{broken')).toEqual([]);
        expect(parseRecentColors(null)).toEqual([]);
        expect(parseRecentColors('{"a":1}')).toEqual([]);
    });
});
