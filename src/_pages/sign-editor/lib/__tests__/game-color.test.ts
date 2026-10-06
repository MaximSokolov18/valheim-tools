import { describe, it, expect } from 'vitest';
import { toGameColor, GAME_COLOR_MATRIX_VALUES, GAME_COLOR_FILTER, GAME_COLOR_FILTER_ID } from '../game-color';

describe('toGameColor', () => {
    it('darkens and shifts a calibration-reference purple', () => {
        // #8e24aa is the purple sampled from the original reference in-game screenshot
        // (see docs/superpowers/specs/2026-09-19-realistic-ingame-color-preview-design.md).
        expect(toGameColor('#8e24aa')).toBe('#671e5c');
    });

    it('darkens and shifts a calibration-reference green', () => {
        // #43a047 is the green sampled from the same reference screenshot.
        expect(toGameColor('#43a047')).toBe('#367528');
    });

    it('suppresses full-brightness blue more than full-brightness red or yellow', () => {
        // The matrix's whole reason for existing over a uniform value-multiplier:
        // these three all start at full HSV value, but the game darkens blue far
        // more than red/yellow (sampled from the 16-color reference sign grid).
        expect(toGameColor('#ff0000')).toBe('#bc0000');
        expect(toGameColor('#ffff00')).toBe('#cab920');
        expect(toGameColor('#0000ff')).toBe('#00077a');
    });

    it('renders white as a light, slightly warm gray (as in-game), not pink', () => {
        expect(toGameColor('#ffffff')).toBe('#c8c2b8');
    });

    it('keeps black unchanged (every offset clamps to zero at zero input)', () => {
        expect(toGameColor('#000000')).toBe('#000000');
    });

    it('expands and transforms a 3-digit shorthand hex', () => {
        expect(toGameColor('#abc')).toBe('#848e87');
    });

    it('falls back to black for invalid input, same as normalizeHexColor', () => {
        expect(toGameColor('notacolor')).toBe('#000000');
    });
});

describe('GAME_COLOR_MATRIX_VALUES', () => {
    it('is the exact feColorMatrix values string the matrix produces', () => {
        expect(GAME_COLOR_MATRIX_VALUES).toBe(
            '0.7563 0.0556 -0.0087 0 -0.0189 0.0041 0.7309 0.0361 0 -0.0103 0.1155 0.1292 0.5971 0 -0.1202 0 0 0 1 0',
        );
    });
});

describe('GAME_COLOR_FILTER', () => {
    it('references the GAME_COLOR_FILTER_ID element', () => {
        expect(GAME_COLOR_FILTER).toBe(`url(#${GAME_COLOR_FILTER_ID})`);
    });
});
