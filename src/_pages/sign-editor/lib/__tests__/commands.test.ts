import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';
import {
    toggleBold,
    setFontSize,
    clearFontSize,
    setTextColor,
    setTextColorTransient,
    unsetTextColorTransient,
    insertEmoji,
    insertSprite,
    setHighlightColor,
    clearFormatting,
    clearSign,
} from '../commands';
import { resolveActiveFontSize } from '../font-size';
import { resolveActiveColor, DEFAULT_TEXT_COLOR } from '../text-color';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('toggleBold', () => {
    it('bolds a plain selection', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        toggleBold(editor);
        expect(editor.getHTML()).toBe('<p><strong>hello</strong></p>');
    });

    it('removes bold when the whole selection is already bold', () => {
        const editor = makeEditor('<p><strong>hello</strong></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        toggleBold(editor);
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('extends bold to the whole selection when only part is bold', () => {
        const editor = makeEditor('<p><strong>he</strong>llo</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        toggleBold(editor);
        expect(editor.getHTML()).toBe('<p><strong>hello</strong></p>');
    });

    it('arms bold at a collapsed caret and clears it when the caret moves', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        toggleBold(editor);
        expect(editor.isActive('bold')).toBe(true);

        editor.commands.setTextSelection({ from: 1, to: 1 });
        expect(editor.isActive('bold')).toBe(false);
    });

    it('applies armed bold to subsequently typed text', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        toggleBold(editor);
        editor.view.dispatch(editor.state.tr.insertText('X'));
        expect(editor.getHTML()).toContain('<strong>X</strong>');
    });

    it('is reverted by undo and re-applied by redo', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        toggleBold(editor);
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello</p>');
        editor.commands.redo();
        expect(editor.getHTML()).toBe('<p><strong>hello</strong></p>');
    });
});

describe('setFontSize', () => {
    it('wraps a plain selection in a sized span', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 10);
        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 10; font-size: calc(10 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });

    it('replaces the size when the selection already has one', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 12);
        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 12; font-size: calc(12 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });

    it('clamps out-of-range values', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 99999);
        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 9000; font-size: calc(9000 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });

    it('arms the size at a collapsed caret for the next typed text', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        setFontSize(editor, 10);
        editor.view.dispatch(editor.state.tr.insertText('X'));
        expect(editor.getHTML()).toContain('<span style="--sign-size: 10; font-size: calc(10 * var(--sign-unit)); line-height: 1.1;">X</span>');
    });

    it('disarms the size when the caret moves before any typing', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        setFontSize(editor, 10);

        editor.commands.setTextSelection({ from: 1, to: 1 });
        expect(resolveActiveFontSize(editor)).toBeNull();

        editor.view.dispatch(editor.state.tr.insertText('Y'));
        expect(editor.getHTML()).toBe('<p>Yhello</p>');
        expect(editor.getHTML()).not.toContain('font-size');
    });

    it('is reverted by undo and re-applied by redo', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setFontSize(editor, 10);
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello</p>');
        editor.commands.redo();
        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 10; font-size: calc(10 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });
});

describe('clearFontSize', () => {
    it('removes the size and leaves no empty span', () => {
        const editor = makeEditor('<p><span style="--sign-size: 10">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        clearFontSize(editor);
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('is a no-op on already-unsized text and pushes no undo step', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(clearFontSize(editor)).toBe(false);
        expect(editor.can().undo()).toBe(false);
    });
});

describe('setTextColor', () => {
    it('wraps a plain selection in a colored span', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');
    });

    it('normalizes a 3-digit hex before applying it', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#f00');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');
    });

    it('rejects an invalid color and leaves the document unchanged', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(setTextColor(editor, 'notacolor')).toBe(false);
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('replaces the color when the selection already has one', () => {
        const editor = makeEditor('<p><span style="color: rgb(255, 0, 0)">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#0000ff');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 0, 255);">hello</span></p>');
    });

    it('arms the color at a collapsed caret for the next typed text', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        setTextColor(editor, '#ff0000');
        editor.view.dispatch(editor.state.tr.insertText('X'));
        expect(editor.getHTML()).toContain('<span style="color: rgb(255, 0, 0);">X</span>');
    });

    it('disarms the color when the caret moves before any typing', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        setTextColor(editor, '#ff0000');

        editor.commands.setTextSelection({ from: 1, to: 1 });
        expect(resolveActiveColor(editor)).toBe(DEFAULT_TEXT_COLOR);

        editor.view.dispatch(editor.state.tr.insertText('Y'));
        expect(editor.getHTML()).toBe('<p>Yhello</p>');
        expect(editor.getHTML()).not.toContain('color');
    });

    it('is reverted by undo and re-applied by redo', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello</p>');
        editor.commands.redo();
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');
    });
});

describe('setTextColorTransient', () => {
    it('applies the color without creating an undo step', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColorTransient(editor, '#ff0000');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');
        expect(editor.can().undo()).toBe(false);
    });

    it('rejects an invalid color and leaves the document unchanged', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(setTextColorTransient(editor, 'notacolor')).toBe(false);
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('leaves an earlier recorded color separately undoable, once the drag rolls back to it before committing', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        setTextColor(editor, '#ff0000');

        setTextColorTransient(editor, '#00ff00');
        setTextColorTransient(editor, '#0000ff');
        // The drag's commit step, mirroring `endDrag` in the UI: roll back to
        // the pre-drag color transiently, so the real `setTextColor` below
        // records a clean red -> green transition rather than one from
        // whatever transient color the drag last landed on.
        setTextColorTransient(editor, '#ff0000');
        setTextColor(editor, '#00ff00');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');

        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');

        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });
});

describe('unsetTextColorTransient', () => {
    it('removes the color without creating an undo step', () => {
        const editor = makeEditor('<p><span style="color: #ff0000">hello</span></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        unsetTextColorTransient(editor);
        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(editor.can().undo()).toBe(false);
    });
});

describe('a drag: transient moves followed by a real commit', () => {
    it('collapses into exactly one undo step, back to the pre-drag color', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });

        setTextColorTransient(editor, '#111111');
        setTextColorTransient(editor, '#222222');
        setTextColorTransient(editor, '#333333');
        expect(editor.can().undo()).toBe(false);

        unsetTextColorTransient(editor);
        setTextColor(editor, '#333333');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(51, 51, 51);">hello</span></p>');

        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(editor.can().undo()).toBe(false);
    });
});

describe('insertEmoji', () => {
    it('inserts at a collapsed caret', () => {
        const editor = makeEditor('<p>hi</p>');
        editor.commands.setTextSelection(3);
        insertEmoji(editor, '🔥');
        expect(editor.getHTML()).toBe('<p>hi🔥</p>');
    });

    it('replaces a non-empty selection', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        insertEmoji(editor, '🔥');
        expect(editor.getHTML()).toBe('<p>🔥</p>');
    });
});

describe('insertSprite', () => {
    it('carries an armed highlight onto the sprite', () => {
        const editor = makeEditor('<p></p>');
        setHighlightColor(editor, '#ff0000');
        insertSprite(editor, 1);
        expect(editor.getHTML()).toContain('--sign-mark: #ff0000');
        expect(editor.getHTML()).toContain('data-sprite="1"');
    });

    it('inserts a plain sprite when no mark is armed', () => {
        const editor = makeEditor('<p>hi</p>');
        editor.commands.setTextSelection(3);
        insertSprite(editor, 2);
        expect(editor.getHTML()).not.toContain('--sign-mark');
    });
});

describe('clearFormatting', () => {
    it('strips every mark from the selection and keeps the text', () => {
        const editor = makeEditor(
            '<p><strong><em><u>he</u></em></strong><span style="color: #ff0000; --sign-mark: #00ff00">llo</span> world</p>',
        );
        editor.commands.setTextSelection({ from: 1, to: 6 });
        clearFormatting(editor);
        expect(editor.getHTML()).toBe('<p>hello world</p>');
    });

    it('leaves formatting outside the selection alone', () => {
        const editor = makeEditor('<p><strong>hello</strong></p>');
        editor.commands.setTextSelection({ from: 1, to: 3 });
        clearFormatting(editor);
        expect(editor.getHTML()).toBe('<p>he<strong>llo</strong></p>');
    });

    it('disarms the marks at a collapsed caret so typed text is plain', () => {
        const editor = makeEditor('<p><strong>hello</strong></p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        clearFormatting(editor);
        editor.view.dispatch(editor.state.tr.insertText('X'));
        expect(editor.getHTML()).toBe('<p><strong>hello</strong>X</p>');
    });

    it('is undone in one step', () => {
        const editor = makeEditor('<p><strong>hello</strong></p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        clearFormatting(editor);
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p><strong>hello</strong></p>');
    });
});

describe('clearSign', () => {
    it('empties the sign and is undoable', () => {
        const editor = makeEditor('<p><strong>hello</strong></p><p>world</p>');
        expect(clearSign(editor)).toBe(true);
        expect(editor.isEmpty).toBe(true);
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p><strong>hello</strong></p><p>world</p>');
    });

    it('undoes only the clear when it follows an edit within the history group delay', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection(6);
        editor.commands.insertContent('!');
        clearSign(editor);
        editor.commands.undo();
        expect(editor.getHTML()).toBe('<p>hello!</p>');
    });

    it('drops marks armed at the caret', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 6, to: 6 });
        toggleBold(editor);
        clearSign(editor);
        editor.view.dispatch(editor.state.tr.insertText('X'));
        expect(editor.getHTML()).toBe('<p>X</p>');
    });

    it('does nothing on an empty sign', () => {
        const editor = makeEditor('');
        expect(clearSign(editor)).toBe(false);
    });
});
