import { useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import { showSelectionHighlight, hideSelectionHighlight } from '../lib';

/**
 * Keeps the editor's selection visibly highlighted while a toolbar popover is `open`. Opening a popover moves
 * focus into it (its input or popup), which collapses the browser's native selection, so the selected text would
 * look deselected even though commands still apply to it (see `selection-highlight.ts`).
 */
export const useSelectionHighlight = (editor: Editor | null, open: boolean): void => {
    useEffect(() => {
        if (!editor || editor.isDestroyed || !open) {
            return;
        }
        showSelectionHighlight(editor);
        return () => {
            if (!editor.isDestroyed) {
                hideSelectionHighlight(editor);
            }
        };
    }, [editor, open]);
};
