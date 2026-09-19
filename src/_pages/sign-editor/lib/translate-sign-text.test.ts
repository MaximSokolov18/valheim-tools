import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import { toggleBold, setTextColor, setFontSize } from './commands';
import { translateSignText, SIGN_CHAR_LIMIT } from './translate-sign-text';

const makeEditor = (content: string) => new Editor({ extensions: signEditorExtensions, content });

describe('SIGN_CHAR_LIMIT', () => {
    it('is Valheim\'s 50-character sign limit', () => {
        expect(SIGN_CHAR_LIMIT).toBe(50);
    });
});

describe('translateSignText', () => {
    it('returns plain text unchanged when nothing is styled', () => {
        const editor = makeEditor('<p>hello</p>');
        expect(translateSignText(editor)).toBe('hello');
    });

    it('returns an empty string for an empty editor', () => {
        const editor = makeEditor('');
        expect(translateSignText(editor)).toBe('');
    });

    it('drops bold formatting entirely', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        toggleBold(editor);
        expect(translateSignText(editor)).toBe('hello');
    });

    it('wraps an explicitly colored run in a color tag', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<color=#ff0000>hello</color>');
    });

    it('drops a non-hex color (e.g. from a browser paste) instead of emitting malformed markup', () => {
        const editor = makeEditor('<p><span style="color: rgb(255, 0, 0)">hello</span></p>');
        expect(translateSignText(editor)).toBe('hello');
    });

    it('wraps an explicit font size in a size tag', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 40);
        expect(translateSignText(editor)).toBe('<size=40>hello</size>');
    });

    it('nests size inside color when a run has both', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        setFontSize(editor, 40);
        expect(translateSignText(editor)).toBe('<color=#ff0000><size=40>hello</size></color>');
    });

    it('only wraps the styled run, leaving the rest of the text plain', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('hello <color=#ff0000>world</color>');
    });

    it('converts a hard break into the literal two-character sequence \\n', () => {
        const editor = makeEditor('<p>line one<br>line two</p>');
        expect(translateSignText(editor)).toBe('line one\\nline two');
    });

    it('joins separate paragraphs with the literal two-character sequence \\n', () => {
        const editor = makeEditor('<p>first</p><p>second</p>');
        expect(translateSignText(editor)).toBe('first\\nsecond');
    });
});
