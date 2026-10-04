import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { parseFontSize, sizeToCss } from './font-size';

/**
 * Each line of a paragraph made only of sized text is as tall as its own largest
 * size, not the auto-fitted size of the rest of the sign (which is what CSS would use
 * for the paragraph's strut, on every line). Zeroing the paragraph's line-height
 * drops that strut; the sized runs carry their own line-height (see `SignFontSize`), and
 * line breaks are given the size of the run before them.
 */
export const SizedLines = Extension.create({
    name: 'sizedLines',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('sizedLines'),
                props: {
                    decorations: ({ doc }) => {
                        const decorations: Decoration[] = [];
                        doc.forEach((paragraph, offset) => {
                            let allSized = true;
                            let hasContent = false;
                            let largest = 0;
                            const sizes: (number | null)[] = [];
                            paragraph.forEach((node) => {
                                if (!node.isText && node.type.name !== 'sprite') {
                                    sizes.push(null);
                                    return;
                                }
                                hasContent = true;
                                const mark = node.marks.find((m) => m.type.name === 'textStyle');
                                const size = parseFontSize(mark?.attrs.fontSize as string | null | undefined);
                                sizes.push(size);
                                if (size == null) {
                                    allSized = false;
                                } else {
                                    largest = Math.max(largest, size);
                                }
                            });
                            if (!hasContent || !allSized) {
                                return;
                            }
                            decorations.push(
                                Decoration.node(offset, offset + paragraph.nodeSize, { style: 'line-height: 0' }),
                            );
                            // With the strut gone a line break has no height of its own, so a blank line (or a
                            // trailing break) would collapse. Size it like the run before it, as the game's tags carry on.
                            let previous: number | null = null;
                            paragraph.forEach((node, childOffset, index) => {
                                if (node.type.name === 'hardBreak') {
                                    const size = previous ?? largest;
                                    decorations.push(
                                        Decoration.node(offset + 1 + childOffset, offset + 1 + childOffset + node.nodeSize, {
                                            style: `font-size: ${sizeToCss(size)}; line-height: 1.1`,
                                        }),
                                    );
                                } else if (sizes[index] != null) {
                                    previous = sizes[index];
                                }
                            });
                        });
                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});
