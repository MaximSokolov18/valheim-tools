import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../../lib';
import { Toolbar } from '../toolbar';
import { Toaster } from '../../../../../components/ui/toast';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <Toolbar />
        </EditorContext.Provider>,
    );
    return editor;
};

describe('Toolbar text-color picker', () => {
    it('renders the text-color picker alongside the bold button', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: /^Text color/ })).toBeInTheDocument();
    });
});

describe('Toolbar emoji picker', () => {
    it('renders the emoji picker alongside the text-color picker', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: 'Insert emoji' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Text color/ })).toBeInTheDocument();
    });
});

describe('Toolbar format buttons', () => {
    it.each(['Italic', 'Underline', 'Strikethrough', 'Subscript', 'Superscript'])('renders a %s toggle', (name) => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
    });

    it('applies and shows the format on the selection', () => {
        const editor = renderWithEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
        expect(editor.getHTML()).toBe('<p><em>hello</em></p>');
        expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
    });
});

describe('Toolbar font size', () => {
    it('renders the font size control', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: /^Font size/ })).toBeInTheDocument();
    });
});

describe('Toolbar offsets', () => {
    it('renders the vertical and horizontal offset controls', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: 'Vertical offset' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Horizontal offset' })).toBeInTheDocument();
    });

    it('shows a right margin as a negative horizontal offset', () => {
        renderWithEditor('<p><span style="--sign-margin-right: 6">hello</span></p>');
        expect(screen.getByRole('button', { name: 'Horizontal offset: -6' })).toBeInTheDocument();
    });
});

describe('Toolbar popovers keep the selection visible', () => {
    const hasSelectionHighlight = (editor: Editor): boolean =>
        editor.view.dom.querySelector('.sign-editor-force-selection') != null;

    it.each([/^Font size/, /^Vertical offset/, /^Horizontal offset/, /^Highlight color/, /^Insert emoji/])(
        'highlights the selection while %s is open',
        async (name) => {
            const user = userEvent.setup();
            const editor = renderWithEditor('<p>hello</p>');
            act(() => {
                editor.commands.setTextSelection({ from: 1, to: 6 });
            });
            expect(hasSelectionHighlight(editor)).toBe(false);

            await user.click(screen.getByRole('button', { name }));
            expect(hasSelectionHighlight(editor)).toBe(true);

            await user.keyboard('{Escape}');
            expect(hasSelectionHighlight(editor)).toBe(false);
        },
    );
});

describe('Toolbar clear buttons', () => {
    it('clears formatting from the selection', () => {
        const editor = renderWithEditor('<p><strong>hello</strong></p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        fireEvent.click(screen.getByRole('button', { name: 'Clear formatting' }));
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('clears the sign and offers Undo', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        render(<Toaster />);
        await user.click(screen.getByRole('button', { name: 'Clear sign' }));
        expect(editor.isEmpty).toBe(true);
        expect(screen.getByRole('button', { name: 'Clear sign' })).toBeDisabled();

        await user.click(await screen.findByRole('button', { name: 'Undo' }));
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('disables Clear sign while the sign is empty', () => {
        renderWithEditor('');
        expect(screen.getByRole('button', { name: 'Clear sign' })).toBeDisabled();
    });

    it('clears formatting with Mod-\\', () => {
        const editor = renderWithEditor('<p><em>hello</em></p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        fireEvent.keyDown(editor.view.dom, { key: '\\', ctrlKey: true });
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });
});
