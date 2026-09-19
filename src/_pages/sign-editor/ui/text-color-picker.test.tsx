import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { TextColorPicker } from './text-color-picker';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <TextColorPicker />
        </EditorContext.Provider>,
    );
    return editor;
};

const trigger = () => screen.getByRole('button', { name: /^Text color/ });

describe('TextColorPicker', () => {
    it('shows the selection color, and reverts when colors are mixed', () => {
        const editor = renderWithEditor(
            '<p><span style="color: #ff0000">he</span>llo</p>',
        );

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 3 });
        });
        expect(trigger()).toHaveAccessibleName('Text color: #ff0000');

        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        expect(trigger()).toHaveAccessibleName('Text color');
    });

    it('applies a preset to the selection', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Blue' }));

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(30, 136, 229);">hello</span></p>');
    });

    it('applies a typed custom hex color on Enter', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom text color' }), '#00ff00{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');
    });

    it('leaves the color unchanged and the popover open for an invalid typed value', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom text color' }), 'zzz{Enter}');

        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(screen.getByRole('textbox', { name: 'Custom text color' })).toBeVisible();
    });

    it('removes the color when Automatic is chosen', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p><span style="color: #ff0000">hello</span></p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Automatic' }));

        expect(editor.getHTML()).toBe('<p>hello</p>');
    });
});
