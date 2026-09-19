import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from './editor-extensions';
import { resolveClickSelection } from './resolve-click-selection';

const makeEditor = (content: string) =>
    new Editor({ extensions: signEditorExtensions, content });

describe('resolveClickSelection', () => {
    it('falls back to the document end when the point is right of / below the editor', () => {
        // jsdom has no layout, so posAtCoords returns null and getBoundingClientRect
        // is all-zero — a positive point counts as "after" the editor.
        const editor = makeEditor('<p>hello</p>');
        const pos = resolveClickSelection(editor, { left: 500, top: 500 });
        expect(pos).toBe(6);
    });

    it('falls back to the document start when the point is left of / above the editor', () => {
        const editor = makeEditor('<p>hello</p>');
        const pos = resolveClickSelection(editor, { left: -10, top: -10 });
        expect(pos).toBe(1);
    });

    it('produces a position that collapses an existing selection', () => {
        const editor = makeEditor('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });
        expect(editor.state.selection.empty).toBe(false);

        const pos = resolveClickSelection(editor, { left: 500, top: 500 });
        editor.commands.setTextSelection(pos);

        expect(editor.state.selection.empty).toBe(true);
    });
});
