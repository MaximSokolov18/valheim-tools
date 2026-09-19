'use client';

import { useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { Check, Copy } from 'lucide-react';
import { useSignEditor } from '../model';
import { translateSignText, SIGN_CHAR_LIMIT } from '../lib';
import { cn } from '../../../shared/lib';

/** How long the button shows "Copied" before reverting to "Copy". */
const COPIED_RESET_MS = 1500;

export const CopySignPanel = () => {
    const editor = useSignEditor();
    const [copied, setCopied] = useState(false);

    const signText =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? translateSignText(editor) : ''),
        }) ?? '';

    const isOverLimit = signText.length > SIGN_CHAR_LIMIT;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(signText);
        } catch {
            return;
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    };

    return (
        <div className="flex w-full max-w-250 flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Sign text</span>
                <span
                    className={cn(
                        'text-xs tabular-nums',
                        isOverLimit ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {signText.length}/{SIGN_CHAR_LIMIT}
                </span>
            </div>
            <pre className="min-h-10 w-full whitespace-pre-wrap break-words rounded-md border bg-muted p-2 text-sm text-foreground">
                {signText}
            </pre>
            <button
                type="button"
                onClick={handleCopy}
                disabled={signText.length === 0}
                className={cn(
                    'flex items-center justify-center gap-1.5 self-end rounded-md px-3 py-1.5 text-xs font-bold',
                    'bg-control text-control-foreground transition-colors hover:bg-control-hover',
                    'disabled:opacity-50 disabled:pointer-events-none',
                )}
            >
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
    );
};
