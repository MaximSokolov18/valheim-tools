import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../../lib';
import { FontSizeSelect } from '../font-size-select';

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
            '<p><span style="--sign-size: 10">he</span>llo</p>',
        );

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 3 });
        });
        expect(trigger()).toHaveTextContent('10');

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        expect(trigger()).not.toHaveTextContent('10');
    });

    it('applies a preset to the selection', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: '12' }));

        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 12; font-size: calc(12 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });

    it('applies a typed custom size on Enter', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom font size' }), '7{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 7; font-size: calc(7 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
    });

    it('clamps a typed custom size above the maximum', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom font size' }), '99999{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="--sign-size: 9000; font-size: calc(9000 * var(--sign-unit)); line-height: 1.1;">hello</span></p>');
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

        await user.click(screen.getByRole('button', { name: '12' }));
        await user.click(trigger());
        expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
    });

    it('removes the size when Normal is chosen', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p><span style="--sign-size: 10">hello</span></p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Normal' }));

        expect(editor.getHTML()).toBe('<p>hello</p>');
    });
});
