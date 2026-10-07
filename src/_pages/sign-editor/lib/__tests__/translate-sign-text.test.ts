import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';
import {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleSubscript,
    toggleSuperscript,
    setTextColor,
    setFontSize,
    setHighlightColor,
    insertSprite,
} from '../commands';
import { translateSignText, SIGN_CHAR_LIMIT } from '../translate-sign-text';

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
        setFontSize(editor, 10);
        expect(translateSignText(editor)).toBe('<size=10>hello');
    });

    it('nests size inside color when a run has both', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        setFontSize(editor, 10);
        expect(translateSignText(editor)).toBe('<#f00><size=10>hello');
    });

    it('only wraps the styled run, leaving the rest of the text plain', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('hello <#f00>world');
    });

    it('switches back to the default color with <#000> instead of </color> when plain text follows', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>hello<#000> world');
    });

    it('emits no color tag for plain spaces between two colored words', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#00ffff');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#ff00ff');
        expect(translateSignText(editor)).toBe('<#0ff>hello <#f0f>world');
    });

    it('keeps one color across a plain space between two words of that color', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#00ffff');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#00ffff');
        expect(translateSignText(editor)).toBe('<#0ff>hello world');
    });

    it('still colors an underlined space, since the underline takes the color', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });
        toggleUnderline(editor);
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#00ffff');
        editor.commands.setTextSelection({ from: 7, to: 12 });
        setTextColor(editor, '#00ffff');
        expect(translateSignText(editor)).toBe('<#0ff><u>hello</u><#000><u> </u><#0ff><u>world');
    });

    it('emits no tag for text explicitly colored with the default color', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#000000');
        expect(translateSignText(editor)).toBe('hello');
    });

    it('keeps the color across a line break instead of closing it', () => {
        const editor = makeEditor('<p>one</p><p>two</p>');
        editor.commands.setTextSelection({ from: 1, to: 10 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>one\\ntwo');
    });

    it('only opens the next line\'s own color after a line break', () => {
        const editor = makeEditor('<p>one</p><p>two</p>');
        editor.commands.setTextSelection({ from: 1, to: 4 });
        setTextColor(editor, '#ff0000');
        editor.commands.setTextSelection({ from: 6, to: 9 });
        setTextColor(editor, '#ffffff');
        expect(translateSignText(editor)).toBe('<#f00>one\\n<#fff>two');
    });

    it('restores the default color on a plain line that follows a colored one', () => {
        const editor = makeEditor('<p>one</p><p>two</p>');
        editor.commands.setTextSelection({ from: 1, to: 4 });
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00>one\\n<#000>two');
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
        // the intermediate steps carry extra closing tags and would trip the length limit
        const editor = new Editor({
            extensions: signEditorExtensions.filter((extension) => extension.name !== 'signLengthLimit'),
            content: '<p>hello</p>',
        });
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

    it('restores the default color with one tag however many colors came before', () => {
        const editor = makeEditor('<p>abc rest</p>');
        [
            [1, 2, '#ff0000'],
            [2, 3, '#00ffff'],
            [3, 4, '#00ff00'],
        ].forEach(([from, to, hex]) => {
            editor.commands.setTextSelection({ from: from as number, to: to as number });
            setTextColor(editor, hex as string);
        });
        expect(translateSignText(editor)).toBe('<#f00>a<#0ff>b<#0f0>c<#000> rest');
    });
});

describe('translateSignText on/off formats', () => {
    const select = (editor: Editor, from: number, to: number) => editor.commands.setTextSelection({ from, to });

    it.each([
        ['italic', toggleItalic, '<i>hello'],
        ['underline', toggleUnderline, '<u>hello'],
        ['strikethrough', toggleStrike, '<s>hello'],
        ['subscript', toggleSubscript, '<sub>hello'],
        ['superscript', toggleSuperscript, '<sup>hello'],
    ])('emits the %s tag', (_name, toggle, expected) => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        toggle(editor);
        expect(translateSignText(editor)).toBe(expected);
    });

    it('closes the tag when plain text follows', () => {
        const editor = makeEditor('<p>hello world</p>');
        select(editor, 1, 6);
        toggleItalic(editor);
        expect(translateSignText(editor)).toBe('<i>hello</i> world');
    });

    it('keeps one tag open across adjacent runs that share it', () => {
        const editor = makeEditor('<p>hello world</p>');
        select(editor, 1, 12);
        toggleUnderline(editor);
        select(editor, 1, 6);
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00><u>hello</u><#000><u> world');
    });

    it('opens underline after color so the line takes the color', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        toggleUnderline(editor);
        setTextColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<#f00><u>hello');
    });

    it('closes all open tags at a hard break', () => {
        const editor = makeEditor('<p><em>one</em><br>two</p>');
        expect(translateSignText(editor)).toBe('<i>one</i>\\ntwo');
    });

    it('turning on superscript removes subscript', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        toggleSubscript(editor);
        toggleSuperscript(editor);
        expect(translateSignText(editor)).toBe('<sup>hello');
    });

    it('combines formats', () => {
        const editor = makeEditor('<p>hi</p>');
        select(editor, 1, 3);
        toggleItalic(editor);
        toggleStrike(editor);
        expect(translateSignText(editor)).toBe('<s><i>hi');
    });
});

describe('translateSignText highlight', () => {
    it('wraps a highlighted run in a full 6-digit <mark> tag', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setHighlightColor(editor, '#ff0');
        expect(translateSignText(editor)).toBe('<mark=#ffff00>hello');
    });

    it('closes the mark when following text is not highlighted', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setHighlightColor(editor, '#ff0000');
        expect(translateSignText(editor)).toBe('<mark=#ff0000>hello</mark> world');
    });

    it('switches between highlights without closing the previous one', () => {
        const editor = makeEditor('<p>abc</p>');
        editor.commands.setTextSelection({ from: 1, to: 2 });
        setHighlightColor(editor, '#ff0000');
        editor.commands.setTextSelection({ from: 2, to: 3 });
        setHighlightColor(editor, '#00ff00');
        editor.commands.setTextSelection({ from: 3, to: 4 });
        setHighlightColor(editor, '#0000ff');
        expect(translateSignText(editor)).toBe('<mark=#ff0000>a<mark=#00ff00>b<mark=#0000ff>c');
    });

    it('closes every open highlight once plain text follows', () => {
        const editor = makeEditor('<p>ab rest</p>');
        editor.commands.setTextSelection({ from: 1, to: 2 });
        setHighlightColor(editor, '#ff0000');
        editor.commands.setTextSelection({ from: 2, to: 3 });
        setHighlightColor(editor, '#00ff00');
        expect(translateSignText(editor)).toBe('<mark=#ff0000>a<mark=#00ff00>b</mark></mark> rest');
    });

    it('rejects an invalid hex', () => {
        const editor = makeEditor('<p>hello</p>');
        expect(setHighlightColor(editor, 'red')).toBe(false);
    });
});

describe('translateSignText sprites', () => {
    it('emits <sprite=N> for a sprite node, inline with text', () => {
        const editor = new Editor({
            extensions: signEditorExtensions,
            content: '<p>hi <span data-sprite="12"></span>!</p>',
        });
        expect(translateSignText(editor)).toBe('hi <sprite=12>!');
    });

    it('insertSprite inserts a sprite at the caret', () => {
        const editor = makeEditor('<p>hi</p>');
        editor.commands.setTextSelection(3);
        insertSprite(editor, 3);
        expect(translateSignText(editor)).toBe('hi<sprite=3>');
    });
});
