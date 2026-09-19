import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import {
    BASE_FONT_SIZE,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    FONT_SIZE_PRESETS,
    clampFontSize,
    parseFontSize,
    formatFontSize,
    resolveActiveFontSize,
} from './font-size';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('font-size constants', () => {
    it('are the agreed values', () => {
        expect(BASE_FONT_SIZE).toBe(32);
        expect(MIN_FONT_SIZE).toBe(8);
        expect(MAX_FONT_SIZE).toBe(128);
        expect([...FONT_SIZE_PRESETS]).toEqual([12, 16, 20, 24, 28, 32, 40, 48, 64]);
    });
});

describe('clampFontSize', () => {
    it('rounds to an integer', () => {
        expect(clampFontSize(31.6)).toBe(32);
    });

    it('clamps below the minimum', () => {
        expect(clampFontSize(7)).toBe(8);
    });

    it('clamps above the maximum', () => {
        expect(clampFontSize(200)).toBe(128);
    });

    it('falls back to the base size for non-finite input', () => {
        expect(clampFontSize(Number.NaN)).toBe(32);
        expect(clampFontSize(Number.POSITIVE_INFINITY)).toBe(32);
    });
});

describe('parseFontSize', () => {
    it('reads a px string', () => {
        expect(parseFontSize('40px')).toBe(40);
    });

    it('reads a bare number string', () => {
        expect(parseFontSize('40')).toBe(40);
    });

    it('returns null for null, empty, or non-px values', () => {
        expect(parseFontSize(null)).toBeNull();
        expect(parseFontSize(undefined)).toBeNull();
        expect(parseFontSize('')).toBeNull();
        expect(parseFontSize('2em')).toBeNull();
        expect(parseFontSize('abc')).toBeNull();
    });
});

describe('formatFontSize', () => {
    it('appends px', () => {
        expect(formatFontSize(40)).toBe('40px');
    });
});

describe('resolveActiveFontSize', () => {
    it('returns the size when the whole selection has one size', () => {
        const editor = makeEditor('<p><span style="font-size: 40px">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBe(40);
    });

    it('returns null when the selection mixes sizes', () => {
        const editor = makeEditor('<p><span style="font-size: 40px">he</span>llo</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });

    it('returns null when the selection has no size', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });

    it('returns the size for a collapsed caret inside a sized run', () => {
        const editor = makeEditor('<p><span style="font-size: 40px">hello</span></p>');
        editor.commands.setTextSelection({ from: 3, to: 3 });
        expect(resolveActiveFontSize(editor)).toBe(40);
    });

    it('returns the size for a collapsed caret at the leading boundary of a sized run', () => {
        const editor = makeEditor('<p><span style="font-size: 40px">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 1 });
        expect(resolveActiveFontSize(editor)).toBe(40);
    });

    it('returns the size for a collapsed caret at the trailing boundary of a sized run', () => {
        const editor = makeEditor('<p><span style="font-size: 40px">hello</span></p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        expect(resolveActiveFontSize(editor)).toBe(40);
    });

    it('returns null for a selection spanning two different sizes', () => {
        const editor = makeEditor(
            '<p><span style="font-size: 20px">ab</span><span style="font-size: 40px">cd</span></p>',
        );
        editor.commands.setTextSelection({ from: 1, to: 5 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });
});
