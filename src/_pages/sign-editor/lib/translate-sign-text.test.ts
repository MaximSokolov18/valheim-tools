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

    it('wraps an explicitly colored run in the shorthand color tag, shortened to 3 digits', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>hello');
    });

    it('keeps 6-digit hex when a channel cannot be shortened to 3', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff6612');
        expect(translateSignText(editor)).toBe('<#ff6612>hello');
    });

    it('drops a non-hex color (e.g. from a browser paste) instead of emitting malformed markup', () => {
        const editor = makeEditor('<p><span style="color: rgb(255, 0, 0)">hello</span></p>');
        expect(translateSignText(editor)).toBe('hello');
    });

    it('wraps an explicit font size in a size tag', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 40);
        expect(translateSignText(editor)).toBe('<size=40>hello');
    });

    it('nests size inside color when a run has both', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        setFontSize(editor, 40);
        expect(translateSignText(editor)).toBe('<#f00><size=40>hello');
    });

    it('only wraps the styled run, leaving the rest of the text plain', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('hello <#f00>world');
    });

    it('keeps the closing tag on a styled run that is not the last content on the sign', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>hello</color> world');
    });

    it('drops the closing tag on a styled run followed only by a trailing empty paragraph', () => {
        const editor = makeEditor('<p>hello</p><p></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>hello\\n');
    });

    it('converts a hard break into the literal two-character sequence \\n', () => {
        const editor = makeEditor('<p>line one<br>line two</p>');
        expect(translateSignText(editor)).toBe('line one\\nline two');
    });

    it('joins separate paragraphs with the literal two-character sequence \\n', () => {
        const editor = makeEditor('<p>first</p><p>second</p>');
        expect(translateSignText(editor)).toBe('first\\nsecond');
    });

    it('drops the closing tag between two consecutively colored runs, since the next run\'s opening tag already overrides it', () => {
        const editor = makeEditor('<p>hello</p>');
        [
            [1, 2, '#ff0000'],
            [2, 3, '#00ffff'],
            [3, 4, '#ffa500'],
            [4, 5, '#00ff00'],
            [5, 6, '#ffff00'],
        ].forEach(([from, to, hex]) => {
            editor.commands.setTextSelection({ from: from as number, to: to as number });
            setTextColor(editor, hex as string);
        });
        expect(translateSignText(editor)).toBe('<#f00>h<#0ff>e<#ffa500>l<#0f0>l<#ff0>o');
    });

    it('still closes every accumulated color once trailing plain text needs the default color back', () => {
        const editor = makeEditor('<p>abc rest</p>');
        [
            [1, 2, '#ff0000'],
            [2, 3, '#00ffff'],
            [3, 4, '#00ff00'],
        ].forEach(([from, to, hex]) => {
            editor.commands.setTextSelection({ from: from as number, to: to as number });
            setTextColor(editor, hex as string);
        });
        expect(translateSignText(editor)).toBe('<#f00>a<#0ff>b<#0f0>c</color></color></color> rest');
    });
});
