import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * The game only wraps a sign's text at spaces, but browsers also allow a line break between
 * emoji (and CJK characters). This marks every run of non-space characters with `sign-no-break`
 * (`white-space: nowrap`, see globals.css) so the auto-fit shrinks the text to keep such a run
 * on one line, like the game, instead of wrapping it onto a second line at a bigger size.
 */
export const NoBreakWords = Extension.create({
    name: 'noBreakWords',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    decorations(state) {
                        const decorations: Decoration[] = [];
                        state.doc.descendants((node, pos) => {
                            if (!node.isText || !node.text) {
                                return;
                            }
                            for (const match of node.text.matchAll(/\S+/g)) {
                                const from = pos + match.index;
                                decorations.push(
                                    Decoration.inline(from, from + match[0].length, { class: 'sign-no-break' }),
                                );
                            }
                        });
                        return DecorationSet.create(state.doc, decorations);
                    },
                },
            }),
        ];
    },
});
