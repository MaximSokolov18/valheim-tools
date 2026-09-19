import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
