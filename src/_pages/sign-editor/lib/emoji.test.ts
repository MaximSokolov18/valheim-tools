import { describe, it, expect } from 'vitest';
import { EMOJI_CATEGORIES } from './emoji';

describe('EMOJI_CATEGORIES', () => {
    it('has at least one category, each with a label and at least one emoji', () => {
        expect(EMOJI_CATEGORIES.length).toBeGreaterThan(0);
        EMOJI_CATEGORIES.forEach((category) => {
            expect(category.label.length).toBeGreaterThan(0);
            expect(category.emoji.length).toBeGreaterThan(0);
        });
    });

    it('gives every emoji option a non-empty char and label', () => {
        EMOJI_CATEGORIES.flatMap((category) => category.emoji).forEach((option) => {
            expect(option.char.length).toBeGreaterThan(0);
            expect(option.label.length).toBeGreaterThan(0);
        });
    });

    it('has no duplicate emoji character across the whole set', () => {
        const chars = EMOJI_CATEGORIES.flatMap((category) => category.emoji.map((option) => option.char));
        expect(new Set(chars).size).toBe(chars.length);
    });

    it('has no duplicate label across the whole set (labels back aria-label / test selectors)', () => {
        const labels = EMOJI_CATEGORIES.flatMap((category) => category.emoji.map((option) => option.label));
        expect(new Set(labels).size).toBe(labels.length);
    });
});
