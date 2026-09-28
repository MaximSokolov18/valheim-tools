import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

const EMOJI_PRESENTATION_SELECTOR = '️';

/**
 * U+FE0F after a symbol asks the browser for the full-color system emoji
 * font, so pasted or system-keyboard emoji (🛡️, ⚔️, ❤️ …) show up in color
 * while Valheim draws every sign glyph monochrome. The selector carries no
 * meaning in-game, so it is removed from the document as soon as it appears,
 * letting the sign's monochrome Noto Emoji font render the bare symbol.
 */
export const StripEmojiPresentation = Extension.create({
    name: 'stripEmojiPresentation',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                appendTransaction(transactions, _oldState, newState) {
                    if (!transactions.some((tr) => tr.docChanged)) {
                        return null;
                    }
                    const ranges: number[] = [];
                    newState.doc.descendants((node, pos) => {
                        if (!node.isText || !node.text) {
                            return;
                        }
                        for (let i = node.text.indexOf(EMOJI_PRESENTATION_SELECTOR); i !== -1; i = node.text.indexOf(EMOJI_PRESENTATION_SELECTOR, i + 1)) {
                            ranges.push(pos + i);
                        }
                    });
                    if (ranges.length === 0) {
                        return null;
                    }
                    const tr = newState.tr;
                    for (const from of ranges.reverse()) {
                        tr.delete(from, from + 1);
                    }
                    return tr;
                },
            }),
        ];
    },
});
