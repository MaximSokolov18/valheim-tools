import { normalizeHexColor } from './text-color';

/** `h` in degrees [0, 360); `s` and `v` as percentages [0, 100]. */
export type Hsv = { h: number; s: number; v: number };

/**
 * Convert a hex color to HSV, the model the saturation/value square and hue
 * slider each drive one axis of. Invalid input falls back to black
 * (`{ h: 0, s: 0, v: 0 }`), same fallback as `hsvToHex` would round-trip.
 */
export const hexToHsv = (hex: string): Hsv => {
    const normalized = normalizeHexColor(hex) ?? '#000000';
    const r = parseInt(normalized.slice(1, 3), 16) / 255;
    const g = parseInt(normalized.slice(3, 5), 16) / 255;
    const b = parseInt(normalized.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }
    if (h < 0) {
        h += 360;
    }

    const s = max === 0 ? 0 : (delta / max) * 100;
    const v = max * 100;

    return { h, s, v };
};

/** Convert HSV back to lowercase 6-digit hex (`hexToHsv`'s inverse). */
export const hsvToHex = ({ h, s, v }: Hsv): string => {
    const sNorm = s / 100;
    const vNorm = v / 100;
    const hue = ((h % 360) + 360) % 360;
    const sector = Math.floor(hue / 60) % 6;
    const f = hue / 60 - Math.floor(hue / 60);

    const p = vNorm * (1 - sNorm);
    const q = vNorm * (1 - f * sNorm);
    const t = vNorm * (1 - (1 - f) * sNorm);

    const [r, g, b] = [
        [vNorm, t, p],
        [q, vNorm, p],
        [p, vNorm, t],
        [p, q, vNorm],
        [t, p, vNorm],
        [vNorm, p, q],
    ][sector];

    const toChannel = (value: number) =>
        Math.round(value * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`;
};
