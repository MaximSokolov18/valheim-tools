'use client';

import { useEditorState } from '@tiptap/react';
import { RemoveFormatting, Trash2 } from 'lucide-react';
import { useSignEditor } from '../model';
import { clearFormatting, clearSign } from '../lib';
import { Button } from '../../../../components/ui/button';
import { toastManager } from '../../../../components/ui/toast';

const CLEARED_TOAST_ID = 'sign-cleared';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

const CONTROL_CLASS = 'bg-control text-control-foreground hover:bg-control-hover';

/**
 * Toolbar actions that reset the sign. "Clear formatting" strips every format from the selection (or
 * disarms the formats armed at the caret), like Word / Google Docs, shortcut Mod-\. "Clear sign" empties
 * the whole sign; rather than a confirm dialog it is one undo step and raises a toast with an Undo button.
 */
export const ClearButtons = () => {
    const editor = useSignEditor();
    const isEmpty = useEditorState({ editor, selector: ({ editor }) => editor?.isEmpty ?? true }) ?? true;

    const handleClearSign = () => {
        if (!editor || !clearSign(editor)) return;
        toastManager.close(CLEARED_TOAST_ID);
        toastManager.add({
            id: CLEARED_TOAST_ID,
            title: 'Sign cleared',
            actionProps: {
                children: 'Undo',
                onClick: () => {
                    editor.chain().focus().undo().run();
                    toastManager.close(CLEARED_TOAST_ID);
                },
            },
        });
    };

    return (
        <>
            <Button
                size="icon"
                aria-label="Clear formatting"
                title="Clear formatting (Ctrl/⌘+\)"
                onMouseDown={preventFocusSteal}
                onClick={() => editor && clearFormatting(editor)}
                className={CONTROL_CLASS}
            >
                <RemoveFormatting className="size-4" />
            </Button>
            <Button
                size="icon"
                aria-label="Clear sign"
                title="Clear sign"
                disabled={isEmpty}
                onMouseDown={preventFocusSteal}
                onClick={handleClearSign}
                className={`ml-auto ${CONTROL_CLASS}`}
            >
                <Trash2 className="size-4" />
            </Button>
        </>
    );
};
