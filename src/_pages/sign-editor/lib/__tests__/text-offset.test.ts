import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';
import { setTextOffset, clearTextOffset, setHorizontalOffset, clearHorizontalOffset } from '../commands';
import {
    clampOffset,
    maxLineMargins,
    parseOffset,
    parseHorizontalOffset,
    resolveActiveOffset,
    resolveActiveHorizontalOffset,
} from '../text-offset';
import { translateSignText } from '../translate-sign-text';

const makeEditor = (content: string) => new Editor({ extensions: signEditorExtensions, content });
const select = (editor: Editor, from: number, to: number) => editor.commands.setTextSelection({ from, to });

describe('parseOffset / clampOffset', () => {
    it('allows signed vertical offsets and treats 0 as none', () => {
        expect(parseOffset('verticalOffset', '-4')).toBe(-4);
        expect(parseOffset('verticalOffset', '0')).toBeNull();
        expect(parseOffset('verticalOffset', 'abc')).toBeNull();
    });

    it('ignores non-positive margins like the game', () => {
        expect(parseOffset('marginLeft', '-3')).toBeNull();
        expect(parseOffset('marginLeft', '8')).toBe(8);
    });

    it('clamps to the range and rejects non-finite input', () => {
        expect(clampOffset('verticalOffset', 9999)).toBe(100);
        expect(clampOffset('verticalOffset', -9999)).toBe(-100);
        expect(clampOffset('marginLeft', Infinity)).toBeNull();
    });
});

describe('text offsets in the editor', () => {
    it('writes <voffset> and closes it after the run', () => {
        const editor = makeEditor('<p>hello world</p>');
        select(editor, 1, 6);
        setTextOffset(editor, 'verticalOffset', -4);
        expect(translateSignText(editor)).toBe('<voffset=-4>hello</voffset> world');
    });

    it('writes <margin-left>', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        setTextOffset(editor, 'marginLeft', 8);
        expect(translateSignText(editor)).toBe('<margin-left=8>hello');
    });

    it('rejects a non-positive margin without touching the document', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        expect(setTextOffset(editor, 'marginLeft', -2)).toBe(false);
        expect(translateSignText(editor)).toBe('hello');
    });

    it('does not reopen the tag for adjacent runs with the same value', () => {
        const editor = makeEditor('<p>ab</p>');
        select(editor, 1, 3);
        setTextOffset(editor, 'verticalOffset', 2);
        select(editor, 1, 2);
        editor.commands.toggleItalic();
        expect(translateSignText(editor)).toBe('<voffset=2><i>a</i>b');
    });

    it.each([
        ['verticalOffset', 2, '<voffset=2>a</voffset>\\nb'],
        ['marginLeft', 4, '<margin-left=4>a</margin>\\nb'],
        ['marginRight', 4, '<margin-right=4>a</margin>\\nb'],
    ] as const)('closes %s at a line break', (kind, value, expected) => {
        const editor = makeEditor('<p>a<br>b</p>');
        select(editor, 1, 2);
        setTextOffset(editor, kind, value);
        expect(translateSignText(editor)).toBe(expected);
    });

    it('writes <margin-right> and keeps it independent of <margin-left>', () => {
        const editor = makeEditor('<p>hi</p>');
        select(editor, 1, 3);
        setTextOffset(editor, 'marginRight', 5);
        expect(translateSignText(editor)).toBe('<margin-right=5>hi');
        setTextOffset(editor, 'marginLeft', 2);
        expect(translateSignText(editor)).toBe('<margin-left=2><margin-right=5>hi');
        select(editor, 1, 2);
        clearTextOffset(editor, 'marginLeft');
        expect(translateSignText(editor)).toBe('<margin-right=5>h<margin-left=2>i');
        // </margin> resets both sides, so a margin that stays is opened again after it
        select(editor, 2, 3);
        clearTextOffset(editor, 'marginRight');
        expect(translateSignText(editor)).toBe('<margin-right=5>h</margin><margin-left=2>i');
    });

    it('reports the active value and clears it', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        setTextOffset(editor, 'verticalOffset', 4);
        expect(resolveActiveOffset(editor, 'verticalOffset')).toBe(4);
        expect(resolveActiveOffset(editor, 'marginLeft')).toBeNull();
        expect(clearTextOffset(editor, 'verticalOffset')).toBe(true);
        expect(resolveActiveOffset(editor, 'verticalOffset')).toBeNull();
        expect(translateSignText(editor)).toBe('hello');
    });

    it('survives an HTML round trip', () => {
        const editor = makeEditor('<p>hello</p>');
        select(editor, 1, 6);
        setTextOffset(editor, 'verticalOffset', -4);
        setTextOffset(editor, 'marginLeft', 8);
        const copy = makeEditor(editor.getHTML());
        expect(translateSignText(copy)).toBe('<voffset=-4><margin-left=8>hello');
    });
});

describe('horizontal offset (both margins as one signed value)', () => {
    it('parses signed values, clamps them and treats 0 as none', () => {
        expect(parseHorizontalOffset('8')).toBe(8);
        expect(parseHorizontalOffset('-8')).toBe(-8);
        expect(parseHorizontalOffset('-999')).toBe(-100);
        expect(parseHorizontalOffset('0')).toBeNull();
        expect(parseHorizontalOffset('abc')).toBeNull();
    });

    it('writes <margin-left> for a positive value and <margin-right> for a negative one', () => {
        const editor = makeEditor('<p>hi</p>');
        select(editor, 1, 3);
        setHorizontalOffset(editor, 6);
        expect(translateSignText(editor)).toBe('<margin-left=6>hi');
        expect(resolveActiveHorizontalOffset(editor)).toBe(6);
        // switching sides drops the other margin
        setHorizontalOffset(editor, -4);
        expect(translateSignText(editor)).toBe('<margin-right=4>hi');
        expect(resolveActiveHorizontalOffset(editor)).toBe(-4);
    });

    it('rejects 0 and clears both margins', () => {
        const editor = makeEditor('<p>hi</p>');
        select(editor, 1, 3);
        expect(setHorizontalOffset(editor, 0)).toBe(false);
        expect(clearHorizontalOffset(editor)).toBe(false);
        setTextOffset(editor, 'marginLeft', 2);
        setTextOffset(editor, 'marginRight', 5);
        expect(resolveActiveHorizontalOffset(editor)).toBe(-3);
        expect(clearHorizontalOffset(editor)).toBe(true);
        expect(resolveActiveHorizontalOffset(editor)).toBeNull();
        expect(translateSignText(editor)).toBe('hi');
    });

    it('reports nothing for a selection with mixed margins', () => {
        const editor = makeEditor('<p>hi</p>');
        select(editor, 1, 2);
        setHorizontalOffset(editor, 4);
        select(editor, 1, 3);
        expect(resolveActiveHorizontalOffset(editor)).toBeNull();
    });
});

describe('maxLineMargins', () => {
    it('reads each line by its last glyph, like the game aligns it', () => {
        const editor = makeEditor('<p>ddd</p>');
        select(editor, 2, 4);
        setHorizontalOffset(editor, -10);
        expect(translateSignText(editor)).toBe('d<margin-right=10>dd');
        expect(maxLineMargins(editor.state.doc)).toEqual({ left: 0, right: 10 });
    });

    it('ignores a margin closed before the line ends', () => {
        const editor = makeEditor('<p>ddd</p>');
        select(editor, 1, 2);
        setHorizontalOffset(editor, 6);
        expect(maxLineMargins(editor.state.doc)).toEqual({ left: 0, right: 0 });
    });
});
