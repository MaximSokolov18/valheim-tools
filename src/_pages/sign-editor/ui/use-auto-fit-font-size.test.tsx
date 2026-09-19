import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { useAutoFitFontSize } from './use-auto-fit-font-size';

/**
 * jsdom has no real layout, so `clientWidth`/`clientHeight` are fixed and
 * `scrollWidth`/`scrollHeight` are stubbed to "overflow" once the applied
 * font-size exceeds `state.overflowAt` — standing in for "the content no longer fits".
 */
const stubLayout = (el: HTMLElement, state: { overflowAt: number }) => {
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 1000 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(el, 'scrollWidth', {
        configurable: true,
        get: () => (parseFloat(el.style.fontSize || '0') <= state.overflowAt ? 1000 : 1001),
    });
    Object.defineProperty(el, 'scrollHeight', {
        configurable: true,
        get: () => (parseFloat(el.style.fontSize || '0') <= state.overflowAt ? 500 : 501),
    });
};

const Harness = ({ editor, state }: { editor: Editor; state: { overflowAt: number } }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useAutoFitFontSize(editor, containerRef);
    return (
        <div
            ref={(node) => {
                containerRef.current = node;
                if (node) stubLayout(node, state);
            }}
        >
            <EditorContent editor={editor} />
        </div>
    );
};

describe('useAutoFitFontSize', () => {
    it('sizes the container to the largest font size that fits on mount', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const state = { overflowAt: 60 };
        const { container } = render(<Harness editor={editor} state={state} />);

        expect((container.firstChild as HTMLElement).style.fontSize).toBe('60px');
    });

    it('shrinks the font size when the editor content changes and overflows more', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const state = { overflowAt: 60 };
        const { container } = render(<Harness editor={editor} state={state} />);
        expect((container.firstChild as HTMLElement).style.fontSize).toBe('60px');

        state.overflowAt = 20;
        act(() => {
            editor.commands.insertContent(' there, much more text now');
        });

        expect((container.firstChild as HTMLElement).style.fontSize).toBe('20px');
    });
});
