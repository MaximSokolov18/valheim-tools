import type { Editor } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';

/**
 * The document position where a click on the sign board should place the caret.
 *
 * When the pointer is over the text ProseMirror resolves the exact character
 * (`posAtCoords`). When it lands on the bare wood — outside the editor's DOM box —
 * there is nothing to resolve, so we snap to the start of the sign for a click
 * above/left of the text and to the end for anything else.
 *
 * Callers apply the result with `setTextSelection(pos)`, which is a *collapsed*
 * selection, so any existing highlight is cleared.
 */
export function resolveClickSelection(
    editor: Editor,
    coords: { left: number; top: number },
): number {
    const resolved = tryPosAtCoords(editor, coords);
    if (resolved != null) {
        return resolved;
    }

    const rect = editor.view.dom.getBoundingClientRect();
    const isBeforeEditor = coords.top < rect.top || coords.left < rect.left;

    return isBeforeEditor
        ? Selection.atStart(editor.state.doc).from
        : Selection.atEnd(editor.state.doc).from;
}

/**
 * `posAtCoords` needs real layout (`elementFromPoint`); it returns `null` when the
 * point is outside the editor and throws in environments without layout (jsdom).
 * Both mean "no character under the pointer".
 */
function tryPosAtCoords(
    editor: Editor,
    coords: { left: number; top: number },
): number | null {
    try {
        return editor.view.posAtCoords(coords)?.pos ?? null;
    } catch {
        return null;
    }
}
