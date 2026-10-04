import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { translateSignDoc, SIGN_CHAR_LIMIT } from './translate-sign-text';

/** Removed from the document by StripEmojiPresentation right after each edit, so it must not count. */
const EMOJI_PRESENTATION_SELECTOR = /\uFE0F/g;
const signLength = (doc: Parameters<typeof translateSignDoc>[0]): number =>
    translateSignDoc(doc).replace(EMOJI_PRESENTATION_SELECTOR, '').length;

export interface SignLengthLimitOptions {
    /** Called each time an edit is rejected for pushing the sign past `SIGN_CHAR_LIMIT`. */
    onLimitReached?: () => void;
}

/**
 * Valheim's sign text box refuses input past `SIGN_CHAR_LIMIT` characters,
 * counted on the translated markup (tags included). This rejects any
 * transaction that would leave the translated text over the limit *and*
 * longer than before, so edits that shrink an already-over-limit sign
 * (deleting, or loading over-long content) still go through.
 */
export const SignLengthLimit = Extension.create<SignLengthLimitOptions>({
    name: 'signLengthLimit',

    addOptions() {
        return { onLimitReached: undefined };
    },

    addProseMirrorPlugins() {
        const { options } = this;
        return [
            new Plugin({
                filterTransaction(tr, state) {
                    if (!tr.docChanged) return true;
                    const nextLength = signLength(tr.doc.toJSON());
                    if (nextLength <= SIGN_CHAR_LIMIT) return true;
                    if (nextLength <= signLength(state.doc.toJSON())) return true;
                    options.onLimitReached?.();
                    return false;
                },
            }),
        ];
    },
});
