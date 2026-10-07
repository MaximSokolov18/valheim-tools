import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../../lib';
import { recentColorsStore } from '../../model';
import { RECENT_COLORS_KEYS } from '../../model/recent-colors-store';
import { TextColorPicker } from '../text-color-picker';
import { HighlightColorPicker } from '../highlight-color-picker';

const renderPickers = (content = '<p>hello</p>') => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <TextColorPicker />
            <HighlightColorPicker />
        </EditorContext.Provider>,
    );
    act(() => {
        editor.commands.setTextSelection({ from: 1, to: 6 });
    });
    return editor;
};

const textTrigger = () => screen.getByRole('button', { name: /^Text color/ });
const hexInput = () => screen.getByRole('textbox', { name: 'Custom text color' });

beforeEach(() => {
    window.localStorage.clear();
    recentColorsStore.reset();
});

describe('color picker enhancements', () => {
    it('labels the hex field and accepts a code without #', async () => {
        const user = userEvent.setup();
        const editor = renderPickers();
        await user.click(textTrigger());

        expect(screen.getByRole('group', { name: 'Hex code' })).toContainElement(hexInput());
        await user.clear(hexInput());
        await user.type(hexInput(), 'ff8800{Enter}');

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 136, 0);">hello</span></p>');
    });

    it('explains an invalid code instead of failing silently', async () => {
        const user = userEvent.setup();
        renderPickers();
        await user.click(textTrigger());
        await user.clear(hexInput());
        await user.type(hexInput(), 'ff88{Enter}');

        expect(hexInput()).toHaveAttribute('aria-invalid', 'true');
        expect(hexInput()).toHaveAccessibleDescription(/3 or 6 hex digits/);
    });

    it('keeps a separate recent list for each tool', async () => {
        const user = userEvent.setup();
        const editor = renderPickers();
        await user.click(textTrigger());
        await user.clear(hexInput());
        await user.type(hexInput(), '#c0ffee{Enter}');
        expect(JSON.parse(window.localStorage.getItem(RECENT_COLORS_KEYS.text) ?? '[]')).toEqual(['#c0ffee']);

        // The highlight picker has no recent colors yet: text colors stay in the text tool.
        await user.click(screen.getByRole('button', { name: /^Highlight color/ }));
        expect(screen.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Custom highlight color' }), '#123456{Enter}');
        expect(editor.getHTML()).toContain('--sign-mark: #123456');
        expect(JSON.parse(window.localStorage.getItem(RECENT_COLORS_KEYS.highlight) ?? '[]')).toEqual(['#123456']);

        await user.click(textTrigger());
        expect(screen.getByRole('button', { name: 'Recent color #c0ffee' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Recent color #123456' })).not.toBeInTheDocument();
    });

    it('resets the text to the default color, removing the color tag, as one undo step', async () => {
        const user = userEvent.setup();
        const editor = renderPickers('<p><span style="color: #ff0000">hello</span></p>');
        await user.click(textTrigger());
        await user.clear(hexInput());
        await user.type(hexInput(), '#00ff00');
        await user.click(screen.getByRole('button', { name: /Default color/ }));

        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(textTrigger()).toHaveAccessibleName('Text color: #000000');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        act(() => {
            editor.commands.undo();
        });
        expect(editor.getHTML()).toContain('rgb(255, 0, 0)');
    });

    it('does not add presets to the recent colors', async () => {
        const user = userEvent.setup();
        renderPickers();
        await user.click(textTrigger());
        await user.click(screen.getByRole('button', { name: 'Blue' }));
        await user.click(textTrigger());

        expect(screen.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument();
    });
});
