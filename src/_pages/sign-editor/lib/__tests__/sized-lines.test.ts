import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '..';

const render = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    const el = document.createElement('div');
    el.appendChild(editor.view.dom);
    return el;
};

describe('SizedLines', () => {
    it('drops the shared line strut of a line made only of sized text', () => {
        const el = render(
            '<p><span style="--sign-size: 5">a</span><span style="--sign-size: 9">b</span></p><p>plain</p>',
        );
        const [sized, plain] = Array.from(el.querySelectorAll('p'));
        expect(sized.getAttribute('style')).toContain('line-height: 0');
        expect(plain.getAttribute('style')).toBeNull();
    });

    it('leaves a line that mixes sized and unsized text alone', () => {
        const el = render('<p><span style="--sign-size: 9">a</span>b</p>');
        expect(el.querySelector('p')?.getAttribute('style')).toBeNull();
    });
});

describe('SizedLines line breaks', () => {
    it('gives a blank line in a fully sized paragraph the size of the run before it', () => {
        const el = render(
            '<p><span style="--sign-size: 10">a</span><br><br><span style="--sign-size: 4">b</span></p>',
        );
        const breaks = Array.from(el.querySelectorAll('br:not(.ProseMirror-trailingBreak)'));
        expect(breaks).toHaveLength(2);
        expect(breaks[0].getAttribute('style')).toContain('calc(10 * var(--sign-unit))');
        expect(breaks[1].getAttribute('style')).toContain('calc(10 * var(--sign-unit))');
    });
});
