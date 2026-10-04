import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../editor-extensions';

const makeEditor = (content = '<p></p>') =>
    new Editor({ extensions: signEditorExtensions, content });

describe('signEditorExtensions', () => {
    it('enables the bold mark', () => {
        const editor = makeEditor();
        expect(editor.schema.marks.bold).toBeDefined();
    });

    it('does not register block formats a sign does not need', () => {
        const editor = makeEditor();
        expect(editor.schema.nodes.heading).toBeUndefined();
        expect(editor.schema.nodes.bulletList).toBeUndefined();
        expect(editor.schema.nodes.codeBlock).toBeUndefined();
        expect(editor.schema.nodes.blockquote).toBeUndefined();
    });

    it('registers the inline formats a sign supports', () => {
        const editor = makeEditor();
        ['italic', 'underline', 'strike', 'subscript', 'superscript'].forEach((mark) => {
            expect(editor.schema.marks[mark]).toBeDefined();
        });
    });

    it('does not register inline marks that are out of scope', () => {
        const editor = makeEditor();
        expect(editor.schema.marks.link).toBeUndefined();
        expect(editor.schema.marks.code).toBeUndefined();
    });

    it('flattens pasted heading markup into a paragraph', () => {
        const editor = makeEditor('<h1>Title</h1>');
        expect(editor.getHTML()).toBe('<p>Title</p>');
    });

    it('keeps hard breaks', () => {
        const editor = makeEditor();
        expect(editor.schema.nodes.hardBreak).toBeDefined();
    });

    it('registers the placeholder extension', () => {
        const editor = makeEditor();
        expect(
            editor.extensionManager.extensions.some((extension) => extension.name === 'placeholder'),
        ).toBe(true);
    });

    it('enables the text-style mark used for font size', () => {
        const editor = makeEditor();
        expect(editor.schema.marks.textStyle).toBeDefined();
    });

    it('registers the fontSize extension', () => {
        const editor = makeEditor();
        expect(
            editor.extensionManager.extensions.some((extension) => extension.name === 'fontSize'),
        ).toBe(true);
    });

    it('registers the color extension', () => {
        const editor = makeEditor();
        expect(
            editor.extensionManager.extensions.some((extension) => extension.name === 'color'),
        ).toBe(true);
    });

    it('strips the U+FE0F emoji-presentation selector from inserted content', () => {
        const editor = makeEditor();
        editor.commands.insertContent('a\u{1F6E1}\uFE0Fb');
        expect(editor.getText()).toBe('a\u{1F6E1}b');
    });
});

describe('pasted font sizes', () => {
    it('keeps a valid --sign-size and drops junk or old pixel sizes', () => {
        const editor = new Editor({
            extensions: signEditorExtensions,
            content: '<p><span style="--sign-size: 9">a</span><span style="--sign-size: foo">b</span><span style="font-size: 32px">c</span></p>',
        });
        const sizes: unknown[] = [];
        editor.state.doc.descendants((node) => {
            if (node.isText) sizes.push(node.marks.find((m) => m.type.name === 'textStyle')?.attrs.fontSize ?? null);
        });
        expect(sizes).toEqual(['9', null]); // the junk and old-pixel runs merge into one unsized node
    });
});
