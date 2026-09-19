import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { Toolbar } from './toolbar';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <Toolbar />
        </EditorContext.Provider>,
    );
    return editor;
};

describe('Toolbar bold button', () => {
    it('reflects the selection bold state and updates when it changes', () => {
        const editor = renderWithEditor('<p>bold me</p>');
        const button = screen.getByRole('button', { name: 'B' });

        expect(button).toHaveAttribute('aria-pressed', 'false');

        act(() => {
            editor.chain().setTextSelection({ from: 1, to: 8 }).toggleBold().run();
        });
        expect(button).toHaveAttribute('aria-pressed', 'true');

        act(() => {
            editor.chain().setTextSelection({ from: 1, to: 8 }).toggleBold().run();
        });
        expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('bolds the selected text when clicked', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>bold me</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 8 });
        });

        await user.click(screen.getByRole('button', { name: 'B' }));

        expect(editor.getHTML()).toBe('<p><strong>bold me</strong></p>');
    });
});

describe('Toolbar text-color picker', () => {
    it('renders the text-color picker alongside the bold button', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Text color/ })).toBeInTheDocument();
    });
});
