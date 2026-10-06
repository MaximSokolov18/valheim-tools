'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { EditorContext, useCurrentEditor, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { createSignEditorExtensions, SIGN_CHAR_LIMIT } from '../lib';
import { Toaster, toastManager } from '../../../../components/ui/toast';
import { loadDraft, saveDraft } from './saved-signs-store';

const LIMIT_TOAST_ID = 'sign-char-limit';

/** How long typing must pause before the board is written to storage. */
const DRAFT_SAVE_DELAY_MS = 400;

/** Attributes of the editable sign text, shared with the read-only boards of saved signs. */
export const SIGN_TEXT_ATTRIBUTES = {
    // Base (auto-fit) font size is set dynamically by useAutoFitFontSize (ui/use-auto-fit-font-size.ts).
    class: 'text-center leading-[1.1] [font-family:var(--font-norse),var(--font-noto-emoji)]',
} as const;

/**
 * Keeps the board across visits: writes it to storage shortly after each edit,
 * and right away when the page is hidden or closed.
 */
const usePersistentDraft = (editor: Editor | null) => {
    useEffect(() => {
        if (!editor) return;
        let timer: number | undefined;
        const save = () => {
            window.clearTimeout(timer);
            if (!editor.isDestroyed) saveDraft(editor.getJSON());
        };
        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(save, DRAFT_SAVE_DELAY_MS);
        };
        const onHide = () => {
            if (document.visibilityState === 'hidden') save();
        };
        editor.on('update', schedule);
        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', onHide);
        return () => {
            save();
            editor.off('update', schedule);
            window.removeEventListener('pagehide', save);
            document.removeEventListener('visibilitychange', onHide);
        };
    }, [editor]);
};

/**
 * Creates the one editor instance for the sign editor and shares it through
 * TipTap's own context so sibling components (Border, Toolbar) read the same
 * instance. `immediatelyRender: false` is required under the App Router to
 * avoid a hydration mismatch.
 */
export const SignEditorProvider = ({ children }: { children: ReactNode }) => {
    const extensions = useMemo(
        () =>
            createSignEditorExtensions(() => {
                // fixed id: re-adding replaces the toast so repeated blocked keystrokes don't stack
                toastManager.close(LIMIT_TOAST_ID);
                toastManager.add({
                    id: LIMIT_TOAST_ID,
                    type: 'error',
                    title: 'Character limit reached',
                    description: `Valheim signs hold at most ${SIGN_CHAR_LIMIT} characters (formatting tags count too).`,
                });
            }),
        [],
    );

    // The last board, restored as the starting content: no undo step, no flash of an empty board.
    // Tiptap falls back to an empty document if a stored draft is no longer valid.
    const [initialContent] = useState(() => (typeof window === 'undefined' ? null : loadDraft()));

    const editor = useEditor({
        extensions,
        content: initialContent ?? '',
        immediatelyRender: false,
        editorProps: {
            attributes: { ...SIGN_TEXT_ATTRIBUTES },
            // Mousedown-and-drag starting on top of an existing selection is the
            // browser's cue for a native "drag this selection" gesture rather than
            // extending it. The board's wood/padding around the text isn't a
            // registered ProseMirror drop target, so dragging the selection out
            // there is an invalid drop the browser cancels — and cancelling
            // collapses the source selection (DOM *and* ProseMirror's own model),
            // making a perfectly normal selection-then-drag-out gesture look like
            // random deselection. This editor has no use for dragging text around,
            // so blocking `dragstart` outright keeps every such gesture a plain
            // (uncancellable) selection-extend instead.
            handleDOMEvents: {
                dragstart: (_view, event) => {
                    event.preventDefault();
                    return true;
                },
            },
        },
    });

    usePersistentDraft(editor);

    return (
        <EditorContext.Provider value={{ editor }}>
            {children}
            <Toaster />
        </EditorContext.Provider>
    );
};

/** The shared sign-editor instance; `null` until the first client render. */
export const useSignEditor = (): Editor | null => useCurrentEditor().editor;
