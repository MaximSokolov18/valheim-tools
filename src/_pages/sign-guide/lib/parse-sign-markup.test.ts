import { describe, expect, it } from 'vitest';
import { parseHexColor, parseSignMarkup } from './parse-sign-markup';

const texts = (markup: string) => parseSignMarkup(markup).map((line) => line.runs.map((run) => run.text).join(''));

describe('parseHexColor', () => {
    it('expands short codes and reads opacity digits', () => {
        expect(parseHexColor('#f6f')).toEqual({ hex: '#ff66ff', opacity: 1 });
        expect(parseHexColor('#0f08')?.hex).toBe('#00ff00');
        expect(parseHexColor('#0f08')?.opacity).toBeCloseTo(0.533, 2);
        expect(parseHexColor('#12345')).toBeNull();
    });
});

describe('parseSignMarkup', () => {
    it('splits lines on the escaped \\n and \\v, not on tags', () => {
        expect(texts('MEAD HALL\\nopen\\vlate')).toEqual(['MEAD HALL', 'open', 'late']);
    });

    it('treats <#f00> and <color=red> as the same red, and </color> restores the previous colour', () => {
        const [line] = parseSignMarkup('<color=red>A<#f00>B</color>C</color>D');
        // Runs with the same style merge, so the two reds read as one run.
        expect(line.runs.map((r) => [r.text, r.style.color])).toEqual([
            ['ABC', '#ff0000'],
            ['D', '#000000'],
        ]);
    });

    it('gives underline the colour that was active when <u> opened', () => {
        const red = parseSignMarkup('<#f00><u>Line')[0].runs[0].style;
        expect(red.underline).toBe('#ff0000');
        const black = parseSignMarkup('<u><#f00>Line')[0].runs[0].style;
        expect(black.color).toBe('#ff0000');
        expect(black.underline).toBe('#000000');
    });

    it('keeps sizes absolute and leaves unsized text to auto-fit', () => {
        const [line] = parseSignMarkup('A<size=5>B<size=9>C');
        expect(line.runs.map((r) => r.style.size)).toEqual([null, 5, 9]);
    });

    it('ignores short <mark> codes, like the game', () => {
        expect(parseSignMarkup('<mark=#ff0>A')[0].runs[0].style.mark).toBeNull();
        expect(parseSignMarkup('<mark=#ffff00>A')[0].runs[0].style.mark).toBe('#ffff00');
    });

    it('shows unknown tags as literal text and treats <b> as a no-op', () => {
        expect(texts('<b>A<wave>B')).toEqual(['A<wave>B']);
    });

    it('reads <voffset> and <margin-left>, and drops them on their closing tags', () => {
        const [line] = parseSignMarkup('<voffset=-4>a</voffset>b<margin-left=8>c');
        expect(line.runs.map((r) => [r.style.voffset, r.style.marginLeft])).toEqual([
            [-4, null],
            [null, null],
            [null, 8],
        ]);
    });

    it('ignores a negative margin and shows a valueless <voffset> literally', () => {
        expect(parseSignMarkup('<margin-left=-3>a')[0].runs[0].style.marginLeft).toBeNull();
        expect(texts('<voffset>a')).toEqual(['<voffset>a']);
    });

    it('reads <margin-right> separately from <margin-left>', () => {
        const [line] = parseSignMarkup('<margin-right=100>a</margin-right>b');
        expect(line.runs.map((r) => [r.style.marginLeft, r.style.marginRight])).toEqual([
            [null, 100],
            [null, null],
        ]);
    });
});
