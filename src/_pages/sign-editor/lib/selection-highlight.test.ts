import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import { showSelectionHighlight, hideSelectionHighlight } from './selection-highlight';

const makeEditor = (content: string) => new Editor({ extensions: signEditorExtensions, content });

const hasHighlight = (editor: Editor): boolean =>
    editor.view.dom.querySelector('.sign-editor-force-selection') != null;

describe('selection highlight decoration', () => {
    it('is absent until shown', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        expect(hasHighlight(editor)).toBe(false);
    });

    it('decorates the current selection once shown', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        showSelectionHighlight(editor);
        expect(hasHighlight(editor)).toBe(true);
    });

    it('does not decorate a collapsed selection even when shown', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 1 });
        showSelectionHighlight(editor);
        expect(hasHighlight(editor)).toBe(false);
    });

    it('is removed once hidden again', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        showSelectionHighlight(editor);
        hideSelectionHighlight(editor);
        expect(hasHighlight(editor)).toBe(false);
    });

    it('does not create an undo step', () => {
        const editor = makeEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        showSelectionHighlight(editor);
        expect(editor.can().undo()).toBe(false);
    });
});
