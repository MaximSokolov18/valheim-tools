'use client';

import { type ReactNode } from 'react';
import { EditorContext, useCurrentEditor, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { signEditorExtensions } from '../lib';

/**
 * Creates the one editor instance for the sign editor and shares it through
 * TipTap's own context so sibling components (Border, Toolbar) read the same
 * instance. `immediatelyRender: false` is required under the App Router to
 * avoid a hydration mismatch.
 */
export const SignEditorProvider = ({ children }: { children: ReactNode }) => {
    const editor = useEditor({
        extensions: signEditorExtensions,
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                // Font size is set dynamically by useAutoFitFontSize (ui/use-auto-fit-font-size.ts).
                class: 'text-center font-[family-name:var(--font-norse)]',
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

    return <EditorContext.Provider value={{ editor }}>{children}</EditorContext.Provider>;
};

/** The shared sign-editor instance; `null` until the first client render. */
export const useSignEditor = (): Editor | null => useCurrentEditor().editor;
