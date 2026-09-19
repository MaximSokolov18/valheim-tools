import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { FontSizeSelect } from './font-size-select';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <FontSizeSelect />
        </EditorContext.Provider>,
    );
    return editor;
};

const trigger = () => screen.getByRole('button', { name: /^Font size/ });

describe('FontSizeSelect', () => {
    it('shows the selection size, and blank when sizes are mixed', () => {
        const editor = renderWithEditor(
            '<p><span style="font-size: 40px">he</span>llo</p>',
        );

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 3 });
        });
        expect(trigger()).toHaveTextContent('40');

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        expect(trigger()).not.toHaveTextContent('40');
    });

    it('applies a preset to the selection', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: '48' }));

        expect(editor.getHTML()).toBe('<p><span style="font-size: 48px;">hello</span></p>');
    });

    it('applies a typed custom size on Enter', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom font size' }), '50{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="font-size: 50px;">hello</span></p>');
    });

    it('clamps a typed custom size above the maximum', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom font size' }), '999{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="font-size: 128px;">hello</span></p>');
    });

    it('marks Normal as pressed for an unsized selection and unpresses it after a preset', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );

        await user.click(screen.getByRole('button', { name: '48' }));
        await user.click(trigger());
        expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
    });

    it('removes the size when Normal is chosen', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p><span style="font-size: 40px">hello</span></p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Normal' }));

        expect(editor.getHTML()).toBe('<p>hello</p>');
    });
});
