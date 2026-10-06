import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { signEditorExtensions } from '../../lib';
import { useAutoFitFontSize } from '../use-auto-fit-font-size';

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
    it('publishes the px-per-size-unit scale and never fits past size 8', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const { container } = render(<Harness editor={editor} state={{ overflowAt: 10_000 }} />);
        const el = container.firstChild as HTMLElement;
        const unit = parseFloat(el.style.getPropertyValue('--sign-unit'));
        expect(unit).toBeGreaterThan(0);
        expect(parseFloat(el.style.fontSize)).toBe(Math.round(8 * unit));
    });

    it('sizes the container to the largest font size that fits on mount', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const state = { overflowAt: 300 };
        const { container } = render(<Harness editor={editor} state={state} />);

        expect((container.firstChild as HTMLElement).style.fontSize).toBe('300px');
    });

    it('shrinks the font size when the editor content changes and overflows more', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const state = { overflowAt: 300 };
        const { container } = render(<Harness editor={editor} state={state} />);
        expect((container.firstChild as HTMLElement).style.fontSize).toBe('300px');

        state.overflowAt = 200;
        act(() => {
            editor.commands.insertContent(' there, much more text now');
        });

        expect((container.firstChild as HTMLElement).style.fontSize).toBe('200px');
    });

    it('keeps unsized text at the size the game leaves it at when sized text takes the room, even when nothing fits', () => {
        const editor = new Editor({
            extensions: signEditorExtensions,
            content: '<p><span style="--sign-size:5">big</span> hi</p>',
        });
        const { container } = render(<Harness editor={editor} state={{ overflowAt: 0 }} />);
        const el = container.firstChild as HTMLElement;
        const unit = parseFloat(el.style.getPropertyValue('--sign-unit'));

        expect(parseFloat(el.style.fontSize)).toBe(Math.round(2 * unit));
    });

    it('lets plain unsized text shrink further, so an unspaced run such as a dozen emoji stays on one line', () => {
        const editor = new Editor({ extensions: signEditorExtensions, content: '<p>hi</p>' });
        const { container } = render(<Harness editor={editor} state={{ overflowAt: 0 }} />);
        const el = container.firstChild as HTMLElement;
        const unit = parseFloat(el.style.getPropertyValue('--sign-unit'));

        expect(parseFloat(el.style.fontSize)).toBe(Math.max(1, Math.round(0.25 * unit)));
    });
});
