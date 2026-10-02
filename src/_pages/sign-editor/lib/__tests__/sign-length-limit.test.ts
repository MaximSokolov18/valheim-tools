import { describe, it, expect, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createSignEditorExtensions } from '../editor-extensions';
import { SIGN_CHAR_LIMIT } from '../translate-sign-text';

const makeEditor = (content: string, onLimitReached = vi.fn()) => ({
    editor: new Editor({ extensions: createSignEditorExtensions(onLimitReached), content }),
    onLimitReached,
});

describe('SignLengthLimit', () => {
    it('accepts text up to the limit without notifying', () => {
        const { editor, onLimitReached } = makeEditor('');
        editor.commands.insertContent('a'.repeat(SIGN_CHAR_LIMIT));
        expect(editor.getText()).toHaveLength(SIGN_CHAR_LIMIT);
        expect(onLimitReached).not.toHaveBeenCalled();
    });

    it('rejects input past the limit and notifies', () => {
        const { editor, onLimitReached } = makeEditor(`<p>${'a'.repeat(SIGN_CHAR_LIMIT)}</p>`);
        editor.commands.insertContent('b');
        expect(editor.getText()).toBe('a'.repeat(SIGN_CHAR_LIMIT));
        expect(onLimitReached).toHaveBeenCalledTimes(1);
    });

    it('still allows deleting at the limit', () => {
        const { editor, onLimitReached } = makeEditor(`<p>${'a'.repeat(SIGN_CHAR_LIMIT)}</p>`);
        editor.commands.deleteRange({ from: 1, to: 2 });
        expect(editor.getText()).toHaveLength(SIGN_CHAR_LIMIT - 1);
        expect(onLimitReached).not.toHaveBeenCalled();
    });

    it('counts markup tags toward the limit', () => {
        const { editor, onLimitReached } = makeEditor(`<p>${'a'.repeat(SIGN_CHAR_LIMIT - 3)}</p>`);
        editor.commands.selectAll();
        editor.commands.setColor('#ff0000');
        expect(onLimitReached).toHaveBeenCalled();
    });
});
