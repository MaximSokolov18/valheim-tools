import { describe, it, expect } from 'vitest';
import { TEXT_COLOR_PRESETS } from './text-color';
import { hexToHsv, hsvToHex } from './hsv-color';

describe('hexToHsv / hsvToHex round-trip', () => {
    it.each(TEXT_COLOR_PRESETS)('round-trips $label ($hex)', ({ hex }) => {
        expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    });

    it('round-trips black', () => {
        expect(hsvToHex(hexToHsv('#000000'))).toBe('#000000');
    });

    it('round-trips white', () => {
        expect(hsvToHex(hexToHsv('#ffffff'))).toBe('#ffffff');
    });

    it('round-trips a mid-tone gray', () => {
        expect(hsvToHex(hexToHsv('#808080'))).toBe('#808080');
    });
});

describe('hexToHsv', () => {
    it('reads pure red as hue 0, full saturation and value', () => {
        expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 });
    });

    it('reads pure green as hue 120', () => {
        expect(hexToHsv('#00ff00')).toEqual({ h: 120, s: 100, v: 100 });
    });

    it('reads pure blue as hue 240', () => {
        expect(hexToHsv('#0000ff')).toEqual({ h: 240, s: 100, v: 100 });
    });

    it('reads white as zero saturation, full value', () => {
        expect(hexToHsv('#ffffff')).toEqual({ h: 0, s: 0, v: 100 });
    });

    it('reads black as zero value', () => {
        expect(hexToHsv('#000000')).toEqual({ h: 0, s: 0, v: 0 });
    });

    it('falls back to black for invalid input', () => {
        expect(hexToHsv('notacolor')).toEqual({ h: 0, s: 0, v: 0 });
    });
});

describe('hsvToHex', () => {
    it('renders hue 0, full saturation and value as red', () => {
        expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe('#ff0000');
    });

    it('renders zero saturation as gray regardless of hue', () => {
        expect(hsvToHex({ h: 200, s: 0, v: 50 })).toBe('#808080');
    });

    it('renders zero value as black regardless of hue/saturation', () => {
        expect(hsvToHex({ h: 90, s: 80, v: 0 })).toBe('#000000');
    });

    it('wraps a hue at or above 360', () => {
        expect(hsvToHex({ h: 360, s: 100, v: 100 })).toBe('#ff0000');
    });
});
