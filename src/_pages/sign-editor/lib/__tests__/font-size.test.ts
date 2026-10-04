import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';
import {
    AUTO_FIT_SIZE,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    FONT_SIZE_PRESETS,
    clampFontSize,
    parseFontSize,
    formatFontSize,
    resolveActiveFontSize,
} from '../font-size';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('font-size constants', () => {
    it('are the agreed values', () => {
        expect(AUTO_FIT_SIZE).toBe(8);
        expect(MIN_FONT_SIZE).toBe(1);
        expect(MAX_FONT_SIZE).toBe(9000);
        expect([...FONT_SIZE_PRESETS]).toEqual([2, 3, 4, 5, 6, 8, 10, 12, 14, 20, 40, 100]);
    });
});

describe('clampFontSize', () => {
    it('rounds to an integer', () => {
        expect(clampFontSize(7.6)).toBe(8);
    });

    it('clamps below the minimum', () => {
        expect(clampFontSize(0)).toBe(1);
    });

    it('clamps above the maximum', () => {
        expect(clampFontSize(99999)).toBe(9000);
    });

    it('falls back to the base size for non-finite input', () => {
        expect(clampFontSize(Number.NaN)).toBe(8);
        expect(clampFontSize(Number.POSITIVE_INFINITY)).toBe(8);
    });
});

describe('parseFontSize', () => {
    it('reads a plain number string', () => {
        expect(parseFontSize('9')).toBe(9);
    });

    it('reads a bare number string', () => {
        expect(parseFontSize('9')).toBe(9);
    });

    it('returns null for null, empty, or other units', () => {
        expect(parseFontSize(null)).toBeNull();
        expect(parseFontSize(undefined)).toBeNull();
        expect(parseFontSize('')).toBeNull();
        expect(parseFontSize('9em')).toBeNull();
        expect(parseFontSize('abc')).toBeNull();
    });
});

describe('formatFontSize', () => {
    it('writes the plain game size', () => {
        expect(formatFontSize(9)).toBe('9');
    });
});

describe('resolveActiveFontSize', () => {
    it('returns the size when the whole selection has one size', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBe(10);
    });

    it('returns null when the selection mixes sizes', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">he</span>llo</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });

    it('returns null when the selection has no size', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });

    it('returns the size for a collapsed caret inside a sized run', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 3, to: 3 });
        expect(resolveActiveFontSize(editor)).toBe(10);
    });

    it('returns the size for a collapsed caret at the leading boundary of a sized run', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 1 });
        expect(resolveActiveFontSize(editor)).toBe(10);
    });

    it('returns the size for a collapsed caret at the trailing boundary of a sized run', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        expect(resolveActiveFontSize(editor)).toBe(10);
    });

    it('returns null for a selection spanning two different sizes', () => {
        const editor = makeEditor(
            '<p><span style="--sign-size: 5">ab</span><span style="--sign-size: 10">cd</span></p>',
        );
        editor.commands.setTextSelection({ from: 1, to: 5 });
        expect(resolveActiveFontSize(editor)).toBeNull();
    });
});
