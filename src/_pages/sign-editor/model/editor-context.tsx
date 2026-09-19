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
        },
    });

    return <EditorContext.Provider value={{ editor }}>{children}</EditorContext.Provider>;
};

/** The shared sign-editor instance; `null` until the first client render. */
export const useSignEditor = (): Editor | null => useCurrentEditor().editor;
