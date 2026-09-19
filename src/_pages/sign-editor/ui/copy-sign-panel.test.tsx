import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { CopySignPanel } from './copy-sign-panel';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <CopySignPanel />
        </EditorContext.Provider>,
    );
    return editor;
};

describe('CopySignPanel', () => {
    let writeText: ReturnType<typeof vi.fn<(data: string) => Promise<void>>>;

    beforeEach(() => {
        writeText = vi.fn<(data: string) => Promise<void>>().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the translated sign text and a counter under the limit', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByText('hello')).toBeInTheDocument();
        const counter = screen.getByText('5/50');
        expect(counter).not.toHaveClass('text-destructive');
    });

    it('updates live as the editor content changes', () => {
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.insertContentAt(6, ' world');
        });
        expect(screen.getByText('hello world')).toBeInTheDocument();
        expect(screen.getByText('11/50')).toBeInTheDocument();
    });

    it('flags the counter once the translated text passes 50 characters', () => {
        renderWithEditor(`<p>${'x'.repeat(51)}</p>`);
        expect(screen.getByText('51/50')).toHaveClass('text-destructive');
    });

    it('copies the translated text to the clipboard and shows a confirmation', async () => {
        const user = userEvent.setup();
        // user-event's setup() installs its own clipboard stub (a getter on
        // navigator.clipboard), overwriting the mock the beforeEach just set —
        // reapply it so the click below calls our spy, not user-event's stub.
        navigator.clipboard.writeText = writeText;
        renderWithEditor('<p>hello</p>');

        await user.click(screen.getByRole('button', { name: /copy/i }));

        expect(writeText).toHaveBeenCalledWith('hello');
        expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
    });

    it('does not show a confirmation when the clipboard write fails', async () => {
        const user = userEvent.setup();
        renderWithEditor('<p>hello</p>');
        navigator.clipboard.writeText = writeText;
        writeText.mockRejectedValueOnce(new Error('denied'));

        await user.click(screen.getByRole('button', { name: /copy/i }));

        expect(await screen.findByRole('button', { name: /^copy$/i })).toBeInTheDocument();
    });

    it('disables the copy button when there is nothing to copy', () => {
        renderWithEditor('');
        expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
    });
});
