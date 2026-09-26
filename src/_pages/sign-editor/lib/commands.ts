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
 * Like `setTextColor`, but the transaction is excluded from undo/redo
 * history (`addToHistory: false`) — for live feedback while dragging the
 * color-picker's saturation/value square or hue slider, or while typing in
 * its hex input, where every pointer move or keystroke would otherwise push
 * its own undo step.
 *
 * Deliberately skips `.focus()` (unlike `setTextColor`): focusing the editor
 * schedules `view.focus()` for the next animation frame whenever the view
 * doesn't already have it (see TipTap's `focus` command), which would yank
 * focus away from the hex input on every keystroke and make it unusable.
 * Since a mark applies to `editor.state.selection` regardless of DOM focus,
 * skipping it doesn't change what gets colored.
 *
 * At the end of the drag or edit, first roll back to the pre-preview color
 * with this function (or `unsetTextColorTransient` if there was none) and
 * only then call `setTextColor` for the final value — that records one clean
 * step from the pre-preview color to the chosen one. Calling `setTextColor`
 * directly mid-preview would instead record a step *from whatever the
 * preview last landed on*, since `addMark`'s invert targets that specific
 * mark instance: once a later transient call has replaced it, an earlier
 * recorded step's undo can silently no-op.
 */
export const setTextColorTransient = (editor: Editor, hex: string): boolean => {
    const normalized = normalizeHexColor(hex);
    if (normalized == null) {
        return false;
    }
    return editor
        .chain()
        .command(({ tr }) => {
            tr.setMeta('addToHistory', false);
            return true;
        })
        .setColor(normalized)
        .run();
};

/**
 * The inverse of `setTextColorTransient` — removes the color transiently, so
 * a drag or edit that started with no explicit color can be rolled back to
 * that state before the real, recorded commit is applied.
 */
export const unsetTextColorTransient = (editor: Editor): boolean =>
    editor
        .chain()
        .command(({ tr }) => {
            tr.setMeta('addToHistory', false);
            return true;
        })
        .unsetColor()
        .run();

/**
 * Inserts `char` at the current selection — replacing it if non-empty, or
 * at the collapsed caret otherwise. Unlike `setFontSize`/`setTextColor`,
 * this isn't a toggleable "apply to selection" operation, so one function
 * covers both cases: TipTap's `insertContent` already does the right thing
 * for a collapsed vs. a live selection.
 */
export const insertEmoji = (editor: Editor, char: string): boolean =>
    editor.chain().focus().insertContent(char).run();
