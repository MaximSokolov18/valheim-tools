import type { Editor } from '@tiptap/core';
import { closeHistory } from '@tiptap/pm/history';
import { clampFontSize, formatFontSize, parseFontSize } from './font-size';
import { normalizeHexColor } from './text-color';
import { HORIZONTAL_OFFSET_SPEC, clampOffset, parseOffset, type OffsetKind } from './text-offset';

/**
 * Toggle the bold mark for the current selection with the semantics people
 * expect from Google Docs / Word:
 *
 *  - non-empty selection: bold the whole range unless it is already entirely
 *    bold, in which case remove bold;
 *  - collapsed caret: arm (or disarm) bold for the next typed characters.
 *
 * All of this is `toggleBold()` from TipTap's Bold extension; `focus()` keeps
 * the caret in the editor after the toolbar button is clicked.
 */
export const toggleBold = (editor: Editor): boolean =>
    editor.chain().focus().toggleBold().run();

/** Toggle italic (`<i>`) with the same selection / armed-caret semantics as `toggleBold`. */
export const toggleItalic = (editor: Editor): boolean =>
    editor.chain().focus().toggleItalic().run();

/** Toggle underline (`<u>`) with the same selection / armed-caret semantics as `toggleBold`. */
export const toggleUnderline = (editor: Editor): boolean =>
    editor.chain().focus().toggleUnderline().run();

/** Toggle strikethrough (`<s>`) with the same selection / armed-caret semantics as `toggleBold`. */
export const toggleStrike = (editor: Editor): boolean =>
    editor.chain().focus().toggleStrike().run();

/**
 * Toggle subscript (`<sub>`). Subscript and superscript are mutually exclusive
 * (a run can't sit above and below the baseline), so turning one on first
 * removes the other.
 */
export const toggleSubscript = (editor: Editor): boolean =>
    editor.chain().focus().unsetSuperscript().toggleSubscript().run();

/** Toggle superscript (`<sup>`); turning it on removes subscript. See `toggleSubscript`. */
export const toggleSuperscript = (editor: Editor): boolean =>
    editor.chain().focus().unsetSubscript().toggleSuperscript().run();

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
 * Set a `<voffset>` (vertical) or `<margin-left>` / `<margin-right>` (horizontal) value on the selection, or arm it at a
 * collapsed caret. The value is rounded and clamped to the kind's range; a margin that is not positive
 * is rejected (the game ignores it) and returns `false`.
 */
export const setTextOffset = (editor: Editor, kind: OffsetKind, value: number): boolean => {
    const clamped = clampOffset(kind, value);
    if (clamped == null || clamped === 0 || (kind !== 'verticalOffset' && value <= 0)) {
        return false;
    }
    return editor.chain().focus().setMark('textStyle', { [kind]: String(clamped) }).run();
};

/** Remove a vertical offset or left margin from the selection. No-op when the selection has none. */
export const clearTextOffset = (editor: Editor, kind: OffsetKind): boolean => {
    if (parseOffset(kind, editor.getAttributes('textStyle')[kind] as string | undefined) == null) {
        return false;
    }
    return editor.chain().focus().setMark('textStyle', { [kind]: null }).removeEmptyTextStyle().run();
};

/**
 * Set the signed horizontal offset on the selection: `N` writes `<margin-left=N>`, `-N` writes `<margin-right=N>`,
 * and either one clears the other side. Rounded and clamped; `0` or non-finite input is rejected (`false`).
 */
export const setHorizontalOffset = (editor: Editor, value: number): boolean => {
    if (!Number.isFinite(value)) {
        return false;
    }
    const { min, max } = HORIZONTAL_OFFSET_SPEC;
    const clamped = Math.min(max, Math.max(min, Math.round(value)));
    if (clamped === 0) {
        return false;
    }
    return editor
        .chain()
        .focus()
        .setMark('textStyle', {
            marginLeft: clamped > 0 ? String(clamped) : null,
            marginRight: clamped < 0 ? String(-clamped) : null,
        })
        .run();
};

/** Remove both margins from the selection. No-op when the selection has neither. */
export const clearHorizontalOffset = (editor: Editor): boolean => {
    const attrs = editor.getAttributes('textStyle');
    if (
        parseOffset('marginLeft', attrs.marginLeft as string | undefined) == null &&
        parseOffset('marginRight', attrs.marginRight as string | undefined) == null
    ) {
        return false;
    }
    return editor.chain().focus().setMark('textStyle', { marginLeft: null, marginRight: null }).removeEmptyTextStyle().run();
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
 * Set the background highlight (`<mark>`) for the selection, or arm it at a
 * collapsed caret. `hex` is normalized like `setTextColor`; invalid input
 * returns `false`. Writes the `backgroundColor` attribute on `textStyle`.
 */
export const setHighlightColor = (editor: Editor, hex: string): boolean => {
    const normalized = normalizeHexColor(hex);
    if (normalized == null) {
        return false;
    }
    return editor.chain().focus().setBackgroundColor(normalized).run();
};

/** Remove the background highlight from the selection. */
export const clearHighlightColor = (editor: Editor): boolean =>
    editor.chain().focus().unsetBackgroundColor().run();

/**
 * Inserts `char` at the current selection — replacing it if non-empty, or
 * at the collapsed caret otherwise. Unlike `setFontSize`/`setTextColor`,
 * this isn't a toggleable "apply to selection" operation, so one function
 * covers both cases: TipTap's `insertContent` already does the right thing
 * for a collapsed vs. a live selection.
 */
export const insertEmoji = (editor: Editor, char: string): boolean =>
    editor.chain().focus().insertContent(char).run();

/**
 * Inserts the in-game `<sprite=index>` graphic at the current selection. Unlike
 * text, an inserted node doesn't pick up the armed (stored) marks on its own, so
 * they are carried over explicitly — otherwise a highlight or color chosen just
 * before inserting would be dropped.
 */
export const insertSprite = (editor: Editor, index: number): boolean => {
    const { storedMarks, selection } = editor.state;
    const marks = (storedMarks ?? selection.$from.marks()).map((mark) => mark.toJSON());
    return editor.chain().focus().insertContent({ type: 'sprite', attrs: { index }, marks }).run();
};

/**
 * "Clear formatting" (Word's Clear All Formatting, Google Docs' Ctrl+\): strip every mark — format toggles,
 * size, offsets, color, highlight — from the selection, sprites included, leaving the text itself. At a
 * collapsed caret it drops the armed (stored) marks, so the next typed characters come out plain. Removing
 * marks from already plain text adds no step, so it never pushes an empty undo entry.
 */
export const clearFormatting = (editor: Editor): boolean =>
    editor
        .chain()
        .focus()
        .unsetAllMarks()
        .command(({ tr }) => {
            tr.setStoredMarks([]);
            return true;
        })
        .run();

/**
 * Empty the whole sign: text, sprites and formatting, including marks armed at the caret. Kept as one
 * ordinary undo step so Ctrl+Z (or the toast's Undo) brings it all back. `false` when the sign is already empty.
 * The history group is closed first: otherwise a clear within 500 ms of typing merges into that typing's undo
 * step, and undoing it would also revert the typing, leaving the sign empty as if Undo did nothing.
 */
export const clearSign = (editor: Editor): boolean => {
    if (editor.isEmpty) {
        return false;
    }
    return editor
        .chain()
        .focus()
        .command(({ tr }) => {
            closeHistory(tr);
            return true;
        })
        .clearContent(true)
        .command(({ tr }) => {
            tr.setStoredMarks([]);
            return true;
        })
        .run();
};
