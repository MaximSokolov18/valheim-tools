import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TextStyle, FontSize, Color } from '@tiptap/extension-text-style';
import type { Extensions } from '@tiptap/core';
import { SelectionHighlight } from './selection-highlight';

/**
 * The extension set for the sign editor.
 *
 * A sign only needs plain paragraphs, hard breaks, bold, per-run font size,
 * per-run text color, and undo/redo. Every other StarterKit format is
 * switched off here. `TextStyle` is the shared `<span style>` mark; `FontSize`
 * adds the `fontSize` attribute and `Color` adds the `color` attribute to
 * that same mark. Adding italic / underline later means flipping a flag
 * below or appending an extension to the array. `SelectionHighlight` keeps
 * the selection visible while the color picker's hex input has focus.
 */
export const signEditorExtensions: Extensions = [
    StarterKit.configure({
        blockquote: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        italic: false,
        link: false,
        listItem: false,
        listKeymap: false,
        orderedList: false,
        strike: false,
        underline: false,
        trailingNode: false,
    }),
    TextStyle,
    FontSize,
    Color,
    Placeholder.configure({ placeholder: 'Carve your rune…' }),
    SelectionHighlight,
];
