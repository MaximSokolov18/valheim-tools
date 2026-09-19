import { describe, it, expect } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
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

/** jsdom never lays elements out, so drag math needs a stubbed geometry. */
const stubRect = (element: HTMLElement) => {
    element.getBoundingClientRect = () =>
        ({ width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100, x: 0, y: 0 }) as DOMRect;
};

const hasSelectionHighlight = (editor: Editor): boolean =>
    editor.view.dom.querySelector('.sign-editor-force-selection') != null;

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

    it('live-previews the color on the board as soon as a full hex is typed, before Enter', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        const input = screen.getByRole('textbox', { name: 'Custom text color' });
        await user.type(input, '#00ff00');

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');
        expect(input).toHaveFocus();
        expect(editor.can().undo()).toBe(false);
    });

    it('keeps a live-typed preview applied if the popover closes without Enter', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom text color' }), '#00ff00');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');

        await user.keyboard('{Escape}');
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');

        act(() => {
            editor.commands.undo();
        });
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('does nothing extra when closing a popover where nothing was previewed', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.keyboard('{Escape}');

        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(editor.can().undo()).toBe(false);
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

    it('shows white as the default color when the selection has none', () => {
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        expect(trigger()).toHaveAccessibleName('Text color: #ffffff');
    });

    it('applies a color while dragging on the saturation/value square', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        const square = screen.getByLabelText('Saturation and brightness');
        stubRect(square);

        fireEvent.pointerDown(square, { pointerId: 1, buttons: 1, clientX: 100, clientY: 0 });

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');
    });

    it('ignores square pointer moves when the button is not held', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        const square = screen.getByLabelText('Saturation and brightness');
        stubRect(square);

        fireEvent.pointerMove(square, { pointerId: 1, buttons: 0, clientX: 100, clientY: 0 });

        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('applies a color while dragging on the hue slider', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        const square = screen.getByLabelText('Saturation and brightness');
        stubRect(square);
        fireEvent.pointerDown(square, { pointerId: 1, buttons: 1, clientX: 100, clientY: 0 });
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');

        const hue = screen.getByLabelText('Hue');
        stubRect(hue);
        fireEvent.pointerDown(hue, { pointerId: 2, buttons: 1, clientX: 100 / 3, clientY: 0 });

        expect(editor.getHTML()).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span></p>');
    });

    it('collapses a whole drag into a single undo step', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        const square = screen.getByLabelText('Saturation and brightness');
        stubRect(square);

        fireEvent.pointerDown(square, { pointerId: 1, buttons: 1, clientX: 20, clientY: 20 });
        fireEvent.pointerMove(square, { pointerId: 1, buttons: 1, clientX: 60, clientY: 40 });
        fireEvent.pointerMove(square, { pointerId: 1, buttons: 1, clientX: 100, clientY: 0 });
        expect(editor.getHTML()).not.toBe('<p>hello</p>');
        expect(editor.can().undo()).toBe(false);

        fireEvent.pointerUp(square, { pointerId: 1 });
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span></p>');

        act(() => {
            editor.commands.undo();
        });
        expect(editor.getHTML()).toBe('<p>hello</p>');
        expect(editor.can().undo()).toBe(false);
    });

    it('leaves a preceding edit undoable separately after a drag', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Blue' }));
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(30, 136, 229);">hello</span></p>');

        await user.click(trigger());
        const square = screen.getByLabelText('Saturation and brightness');
        stubRect(square);
        fireEvent.pointerDown(square, { pointerId: 1, buttons: 1, clientX: 20, clientY: 20 });
        fireEvent.pointerMove(square, { pointerId: 1, buttons: 1, clientX: 100, clientY: 0 });
        fireEvent.pointerUp(square, { pointerId: 1 });
        const draggedHtml = editor.getHTML();
        expect(draggedHtml).not.toBe('<p><span style="color: rgb(30, 136, 229);">hello</span></p>');

        act(() => {
            editor.commands.undo();
        });
        expect(editor.getHTML()).toBe('<p><span style="color: rgb(30, 136, 229);">hello</span></p>');

        act(() => {
            editor.commands.undo();
        });
        expect(editor.getHTML()).toBe('<p>hello</p>');
    });

    it('keeps the selection visually highlighted once the hex input takes focus', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });
        expect(hasSelectionHighlight(editor)).toBe(false);

        await user.click(trigger());
        expect(hasSelectionHighlight(editor)).toBe(true);

        await user.click(screen.getByRole('textbox', { name: 'Custom text color' }));
        expect(hasSelectionHighlight(editor)).toBe(true);
    });

    it('turns the highlight back off once the popover closes, via any commit path', async () => {
        const user = userEvent.setup();
        const editor = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        await user.click(trigger());
        await user.click(screen.getByRole('button', { name: 'Blue' }));
        expect(hasSelectionHighlight(editor)).toBe(false);

        await user.click(trigger());
        await user.type(screen.getByRole('textbox', { name: 'Custom text color' }), '#00ff00{Enter}');
        expect(hasSelectionHighlight(editor)).toBe(false);
    });
});
