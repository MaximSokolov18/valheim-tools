import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TextStyle, FontSize, Color, BackgroundColor } from '@tiptap/extension-text-style';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import type { Extensions } from '@tiptap/core';
import { SelectionHighlight } from './selection-highlight';
import { NoBreakWords } from './no-break-words';
import { StripEmojiPresentation } from './strip-emoji-presentation';
import { SignLengthLimit } from './sign-length-limit';
import { Sprite } from './sprite-node';
import { SizedLines } from './sized-lines';
import { LineShifts } from './line-shifts';
import { TextOffset } from './text-offset';
import { ClearFormattingShortcut } from './clear-formatting-shortcut';
import { SIZE_VALUE_VAR, parseFontSize, sizeToCss } from './font-size';

/**
 * The extension set for the sign editor.
 *
 * A sign only needs plain paragraphs, hard breaks, bold, italic, underline,
 * strikethrough, subscript, superscript, per-run font size, per-run vertical offset and left margin, per-run text
 * color, per-run background highlight, and undo/redo. Every other StarterKit format is
 * switched off here. `TextStyle` is the shared `<span style>` mark; `FontSize`
 * adds the `fontSize` attribute and `Color` adds the `color` attribute and
 * `BackgroundColor` the `backgroundColor` attribute to
 * that same mark. `SelectionHighlight` keeps
 * the selection visible while the color picker's hex input has focus.
 * `SignLengthLimit` blocks input past Valheim's sign character cap and calls
 * `onLimitReached` when it does.
 */
/**
 * Same `backgroundColor` attribute as TipTap's `BackgroundColor`, but rendered
 * as a `--sign-mark` CSS variable instead of a literal `background-color`, so
 * `globals.css` can draw it at the translucency Valheim's sign renderer uses
 * (in game the `<mark>` block is only a faint tint over the wood, not opaque).
 */
const SignHighlight = BackgroundColor.extend({
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    backgroundColor: {
                        default: null,
                        parseHTML: (element) => element.style.getPropertyValue('--sign-mark') || null,
                        renderHTML: (attributes) =>
                            attributes.backgroundColor ? { style: `--sign-mark: ${attributes.backgroundColor}` } : {},
                    },
                },
            },
        ];
    },
});

/**
 * Same `fontSize` attribute as TipTap's `FontSize`, but holding a Valheim
 * `<size>` number, rendered as a `--sign-size` variable plus a font-size scaled
 * by the board (`--sign-unit`, set by the auto-fit hook) so sized text keeps its
 * absolute game proportions at any board width.
 */
const SignFontSize = FontSize.extend({
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => {
                            const raw = element.style.getPropertyValue(SIZE_VALUE_VAR).trim();
                            return parseFontSize(raw) == null ? null : raw;
                        },
                        renderHTML: (attributes) =>
                            attributes.fontSize
                                ? { style: `${SIZE_VALUE_VAR}: ${attributes.fontSize}; font-size: ${sizeToCss(Number(attributes.fontSize))}; line-height: 1.1` }
                                : {},
                    },
                },
            },
        ];
    },
});

export const createSignEditorExtensions = (onLimitReached?: () => void): Extensions => [
    StarterKit.configure({
        blockquote: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        link: false,
        listItem: false,
        listKeymap: false,
        orderedList: false,
        trailingNode: false,
    }),
    Subscript,
    Superscript,
    TextStyle,
    SignFontSize,
    TextOffset,
    SizedLines,
    LineShifts,
    Color,
    SignHighlight,
    Placeholder.configure({ placeholder: 'Carve your rune…' }),
    SelectionHighlight,
    Sprite,
    NoBreakWords,
    StripEmojiPresentation,
    ClearFormattingShortcut,
    SignLengthLimit.configure({ onLimitReached }),
];

export const signEditorExtensions: Extensions = createSignEditorExtensions();
