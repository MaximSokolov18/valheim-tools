import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import { TEXT_COLOR_PRESETS, isValidHexColor, normalizeHexColor, resolveActiveColor } from './text-color';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('TEXT_COLOR_PRESETS', () => {
    it('is the agreed 8-color palette', () => {
        expect(TEXT_COLOR_PRESETS).toEqual([
            { label: 'Black', hex: '#000000' },
            { label: 'White', hex: '#ffffff' },
            { label: 'Red', hex: '#e53935' },
            { label: 'Orange', hex: '#fb8c00' },
            { label: 'Yellow', hex: '#fdd835' },
            { label: 'Green', hex: '#43a047' },
            { label: 'Blue', hex: '#1e88e5' },
            { label: 'Purple', hex: '#8e24aa' },
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

    it('returns null when the selection has no color', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(resolveActiveColor(editor)).toBeNull();
    });

    it('returns null for a selection spanning two different colors', () => {
        const editor = makeEditor(
            '<p><span style="color: #ff0000">ab</span><span style="color: #0000ff">cd</span></p>',
        );
        editor.commands.setTextSelection({ from: 1, to: 5 });
        expect(resolveActiveColor(editor)).toBeNull();
    });
});
