import { Node, mergeAttributes } from '@tiptap/core';
import { isSpriteIndex, SPRITES } from './sprite';
import { spriteSelection } from './sprite-selection';

/**
 * An inline, atomic `<sprite=N>` graphic. It is drawn in full color from the
 * game's sprite atlas and translates to the literal `<sprite=N>` tag.
 */
export const Sprite = Node.create({
    name: 'sprite',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            index: {
                default: 0,
                parseHTML: (element) => {
                    const value = Number(element.getAttribute('data-sprite'));
                    return isSpriteIndex(value) ? value : 0;
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-sprite]' }];
    },

    addProseMirrorPlugins() {
        return [spriteSelection];
    },

    renderHTML({ node, HTMLAttributes }) {
        const index = isSpriteIndex(node.attrs.index) ? node.attrs.index : 0;
        // An invisible placeholder the overlay paints over. It is deliberately a
        // plain inline box (width via padding) rather than an inline-block: browsers
        // always allow a line break next to atomic inlines, but the game only wraps
        // at spaces, so `<sprite=1>text` has to stay on one line.
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-sprite': String(index),
                role: 'img',
                'aria-label': SPRITES[index].label,
                style: 'display:inline;padding-left:1em',
            }),
        ];
    },
});
