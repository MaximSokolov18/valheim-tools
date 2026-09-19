import { describe, it, expect, vi } from 'vitest';
import { computeAutoFitFontSize } from './auto-fit-font-size';

describe('computeAutoFitFontSize', () => {
    it('returns the largest size that fits', () => {
        const fits = (n: number) => n <= 47;
        expect(computeAutoFitFontSize({ min: 8, max: 128, fits })).toBe(47);
    });

    it('returns max when everything fits', () => {
        expect(computeAutoFitFontSize({ min: 8, max: 128, fits: () => true })).toBe(128);
    });

    it('returns min when nothing fits, including min itself', () => {
        expect(computeAutoFitFontSize({ min: 8, max: 128, fits: () => false })).toBe(8);
    });

    it('returns min immediately without calling fits when min >= max', () => {
        const fits = vi.fn(() => true);
        expect(computeAutoFitFontSize({ min: 40, max: 40, fits })).toBe(40);
        expect(computeAutoFitFontSize({ min: 40, max: 10, fits })).toBe(40);
        expect(fits).not.toHaveBeenCalled();
    });
});
