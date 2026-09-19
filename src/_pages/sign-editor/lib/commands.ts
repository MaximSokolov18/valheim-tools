import type { Editor } from '@tiptap/core';
import { clampFontSize, formatFontSize, parseFontSize } from './font-size';
import { normalizeHexColor } from './text-color';

/**
 * Toggle the bold mark for the current selection with the semantics people
 * expect from Google Docs / Word:
 *
 *  - non-empty selection: bold the whole range unless it is already entirely
 *    bold, in which case remove bold;
 *  - collapsed caret: arm (or disarm) bold for the next typed characters.
 *
 * All of this is `toggleBold()` from TipTap's Bold extension; `focus()` keeps
 * the caret in the editor after the toolbar button is clicked. This helper is
 * the seam where future formats (`toggleItalic`, `setColor`, ...) will live.
 */
export const toggleBold = (editor: Editor): boolean =>
    editor.chain().focus().toggleBold().run();

/**
 * Set the font size (px) for the selection, or arm it at a collapsed caret so
 * the next typed characters get it — the toggle-less "apply to selection"
 * semantics of a Word font-size box. `px` is rounded and clamped to the editor's
 * supported range. Built on the FontSize extension's `setFontSize`, which writes
 * the `fontSize` attribute on the shared `textStyle` mark.
 */
export const setFontSize = (editor: Editor, px: number): boolean =>
    editor.chain().focus().setFontSize(formatFontSize(clampFontSize(px))).run();

/**
 * Remove the font size from the selection (the dropdown's "Normal" entry) so the
 * run falls back to the editor's base size and emits no `<size>` tag later.
 * Early-returns `false` when the selection carries no size, so choosing "Normal"
 * on already-unsized text does not push an empty undo step.
 */
export const clearFontSize = (editor: Editor): boolean => {
    if (parseFontSize(editor.getAttributes('textStyle').fontSize as string | undefined) == null) {
        return false;
    }
    return editor.chain().focus().unsetFontSize().run();
};

/**
 * Set the text color for the selection, or arm it at a collapsed caret so the
 * next typed characters get it — the same toggle-less "apply to selection"
 * semantics as `setFontSize`. `hex` is normalized (3- or 6-digit, any case) to
 * lowercase 6-digit form; an invalid value is rejected and returns `false`
 * without touching the document. Built on the Color extension's `setColor`,
 * which writes the `color` attribute on the shared `textStyle` mark.
 */
export const setTextColor = (editor: Editor, hex: string): boolean => {
    const normalized = normalizeHexColor(hex);
    if (normalized == null) {
        return false;
    }
    return editor.chain().focus().setColor(normalized).run();
};

/**
 * Remove the text color from the selection (the picker's "Automatic" entry)
 * so the run falls back to the sign's default text color. Early-returns
 * `false` when the selection carries no color, so choosing "Automatic" on
 * already-uncolored text does not push an empty undo step.
 */
export const clearTextColor = (editor: Editor): boolean => {
    if (editor.getAttributes('textStyle').color == null) {
        return false;
    }
    return editor.chain().focus().unsetColor().run();
};
