'use client';

import { useMemo, type ReactNode } from 'react';
import { EditorContext, useCurrentEditor, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { createSignEditorExtensions, SIGN_CHAR_LIMIT } from '../lib';
import { Toaster, toastManager } from '../../../../components/ui/toast';

const LIMIT_TOAST_ID = 'sign-char-limit';

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

    const editor = useEditor({
        extensions,
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                // Font size is set dynamically by useAutoFitFontSize (ui/use-auto-fit-font-size.ts).
                class: 'text-center [font-family:var(--font-norse),var(--font-noto-emoji)]',
            },
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

    return (
        <EditorContext.Provider value={{ editor }}>
            {children}
            <Toaster />
        </EditorContext.Provider>
    );
};

/** The shared sign-editor instance; `null` until the first client render. */
export const useSignEditor = (): Editor | null => useCurrentEditor().editor;
