import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { SignEditorProvider, useSignEditor } from './editor-context';

function Probe({ onEditor }: { onEditor?: (editor: Editor | null) => void }) {
    const editor = useSignEditor();
    onEditor?.(editor);
    return <div data-testid="probe">{editor instanceof Editor ? 'editor' : 'null'}</div>;
}

describe('SignEditorProvider', () => {
    it('provides a TipTap editor instance to descendants', () => {
        render(
            <SignEditorProvider>
                <Probe />
            </SignEditorProvider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('editor');
    });

    it('does not hardcode a base font size, since board sizing is auto-fit', () => {
        let captured: Editor | null = null;
        render(
            <SignEditorProvider>
                <Probe onEditor={(editor) => (captured = editor)} />
            </SignEditorProvider>,
        );
        const attributes = (captured as Editor | null)?.options.editorProps.attributes;
        const editorClass = String(
            (typeof attributes === 'function' ? '' : attributes?.['class']) ?? '',
        );
        expect(editorClass).toContain('text-center');
        expect(editorClass).not.toMatch(/text-\[\d+px\]/);
    });

    it('blocks native drag-and-drop of the current selection', () => {
        let captured: Editor | null = null;
        render(
            <SignEditorProvider>
                <Probe onEditor={(editor) => (captured = editor)} />
            </SignEditorProvider>,
        );
        const editor = captured as Editor | null;

        // Mousedown-and-drag on top of an already-selected run of text is
        // the browser's cue to start a native drag-the-selection gesture
        // instead of extending the text selection. Since the board's own
        // wood/padding isn't a registered ProseMirror drop target, dropping
        // there gets treated as an invalid drop and the browser cancels the
        // drag — which collapses the selection, both visually and in the
        // editor's own model. Blocking `dragstart` keeps every such drag a
        // plain selection-extend instead, so it survives leaving the text.
        const notCancelled = fireEvent.dragStart(editor!.view.dom);
        expect(notCancelled).toBe(false);
    });
});
