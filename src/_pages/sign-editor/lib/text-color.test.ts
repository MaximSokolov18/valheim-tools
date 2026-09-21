import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import {
    TEXT_COLOR_PRESETS,
    DEFAULT_TEXT_COLOR,
    isValidHexColor,
    normalizeHexColor,
    shortenHexColor,
    resolveActiveColor,
} from './text-color';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('TEXT_COLOR_PRESETS', () => {
    it('is the agreed 8-color palette', () => {
        expect(TEXT_COLOR_PRESETS).toEqual([
            { label: 'Red', hex: '#ff0000' },
            { label: 'Cyan', hex: '#00ffff' },
            { label: 'Green', hex: '#00ff00' },
            { label: 'Yellow', hex: '#ffff00' },
            { label: 'Orange', hex: '#ffa500' },
            { label: 'Magenta', hex: '#ff00ff' },
            { label: 'White', hex: '#ffffff' },
            { label: 'Blue', hex: '#0000ff' },
        ]);
    });
});

describe('isValidHexColor', () => {
    it('accepts 3- and 6-digit hex, case-insensitively', () => {
        expect(isValidHexColor('#fff')).toBe(true);
        expect(isValidHexColor('#ffffff')).toBe(true);
        expect(isValidHexColor('#FFFFFF')).toBe(true);
    });

    it('rejects missing hash, wrong length, and non-hex values', () => {
        expect(isValidHexColor('fff')).toBe(false);
        expect(isValidHexColor('#ff')).toBe(false);
        expect(isValidHexColor('#ffff')).toBe(false);
        expect(isValidHexColor('red')).toBe(false);
        expect(isValidHexColor('')).toBe(false);
    });
});

describe('normalizeHexColor', () => {
    it('expands and lowercases a 3-digit hex', () => {
        expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
    });

    it('lowercases a 6-digit hex', () => {
        expect(normalizeHexColor('#AABBCC')).toBe('#aabbcc');
    });

    it('returns null for invalid input', () => {
        expect(normalizeHexColor('notacolor')).toBeNull();
        expect(normalizeHexColor('')).toBeNull();
    });
});

describe('shortenHexColor', () => {
    it('shortens to 3 digits when every channel\'s pair matches', () => {
        expect(shortenHexColor('#ff66ff')).toBe('#f6f');
        expect(shortenHexColor('#aabbcc')).toBe('#abc');
        expect(shortenHexColor('#000000')).toBe('#000');
    });

    it('keeps 6 digits when any channel cannot be shortened', () => {
        expect(shortenHexColor('#ff6612')).toBe('#ff6612');
        expect(shortenHexColor('#123456')).toBe('#123456');
    });
});

describe('resolveActiveColor', () => {
    it('returns the color when the whole selection has one color', () => {
        const editor = makeEditor('<p><span style="color: #ff0000">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveColor(editor)).toBe('#ff0000');
    });

    it('returns null when the selection mixes colors', () => {
        const editor = makeEditor('<p><span style="color: #ff0000">he</span>llo</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveColor(editor)).toBeNull();
    });

    it('returns the default white when the selection has no color', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveColor(editor)).toBe(DEFAULT_TEXT_COLOR);
    });

    it('returns null for a selection spanning two different colors', () => {
        const editor = makeEditor(
            '<p><span style="color: #ff0000">ab</span><span style="color: #0000ff">cd</span></p>',
        );
        editor.commands.setTextSelection({ from: 1, to: 5 });
        expect(resolveActiveColor(editor)).toBeNull();
    });
});
