import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions, EMOJI_CATEGORIES } from '../lib';
import { EmojiPicker } from './emoji-picker';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <EmojiPicker />
        </EditorContext.Provider>,
    );
    return editor;
};

const trigger = () => screen.getByRole('button', { name: 'Insert emoji' });

describe('EmojiPicker', () => {
    it('renders a trigger button', () => {
        renderWithEditor('<p>hello</p>');
        expect(trigger()).toBeInTheDocument();
    });

    it('opens the popup and shows every category with its first emoji', async () => {
        const user = userEvent.setup();
        renderWithEditor('<p>hello</p>');

        await user.click(trigger());

        EMOJI_CATEGORIES.forEach((category) => {
            expect(screen.getByText(category.label)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: category.emoji[0].label })).toBeInTheDocument();
        });
    });

    it('inserts the clicked emoji at a collapsed caret and keeps the popover open', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hi</p>');
        act(() => {
            editor.commands.setTextSelection(3);
        });
        const option = EMOJI_CATEGORIES[0].emoji[0];

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: option.label }));

        expect(editor.getHTML()).toBe(`<p>hi${option.char}</p>`);
        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('inserts two different emoji in sequence without closing', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p></p>');
        act(() => {
            editor.commands.setTextSelection(1);
        });
        const [first, second] = EMOJI_CATEGORIES.flatMap((category) => category.emoji);

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: first.label }));
        await user.click(screen.getByRole('button', { name: second.label }));

        expect(editor.getHTML()).toBe(`<p>${first.char}${second.char}</p>`);
    });
});
