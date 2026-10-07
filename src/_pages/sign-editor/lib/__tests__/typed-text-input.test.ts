import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';
import { setTextColor } from '../commands';
import { translateSignText } from '../translate-sign-text';

/** `hello` in cyan, a plain space, `world` in red. */
const makeTwoColorEditor = () => {
    const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hello world</p>' });
    editor.commands.setTextSelection({ from: 1, to: 6 });
    setTextColor(editor, '#00ffff');
    editor.commands.setTextSelection({ from: 7, to: 12 });
    setTextColor(editor, '#e50000');
    return editor;
};

/** Deletes like the browser's Backspace does: the removed text's marks are kept for the next character. */
const deleteKeepingMarks = (editor: Editor, from: number, to: number) => {
    editor.commands.setTextSelection(to);
    const { state } = editor;
    const marks = state.doc.resolve(from).marksAcross(state.doc.resolve(to)) ?? [];
    editor.view.dispatch(state.tr.delete(from, to).ensureMarks(marks));
};

const typeText = (editor: Editor, data: string) => {
    const event = new InputEvent('beforeinput', { inputType: 'insertText', data, bubbles: true, cancelable: true });
    editor.view.dom.dispatchEvent(event);
    return event;
};

describe('TypedTextInput', () => {
    it('continues the previous color after the space between two colors is deleted', () => {
        const editor = makeTwoColorEditor();
        deleteKeepingMarks(editor, 6, 7);
        expect(editor.state.storedMarks).toBeNull();
        editor.view.dispatch(editor.state.tr.insertText('d'));
        expect(translateSignText(editor)).toBe('<#0ff>hellod<#e50000>world');
    });

    it('keeps the marks of deleted visible text for the next character', () => {
        const editor = makeTwoColorEditor();
        deleteKeepingMarks(editor, 7, 8);
        editor.view.dispatch(editor.state.tr.insertText('W'));
        expect(translateSignText(editor)).toBe('<#0ff>hello <#e50000>World');
    });

    it('inserts typed text through a transaction instead of the browser', () => {
        const editor = makeTwoColorEditor();
        editor.commands.setTextSelection(6);
        const event = typeText(editor, '!');
        expect(event.defaultPrevented).toBe(true);
        expect(translateSignText(editor)).toBe('<#0ff>hello! <#e50000>world');
    });

    it('leaves other input to the browser', () => {
        const editor = makeTwoColorEditor();
        const event = new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true });
        editor.view.dom.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
    });
});
