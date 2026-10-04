'use client';

import { useEditorState } from '@tiptap/react';
import { useSignEditor } from '../model';
import { translateSignText, SIGN_CHAR_LIMIT } from '../lib';
import { Card, CardContent } from '../../../../components/ui/card';
import { CharCount } from '../../../../components/char-count';
import { CopyButton } from '../../../../components/copy-button';

export const CopySignPanel = () => {
    const editor = useSignEditor();

    const signText =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? translateSignText(editor) : ''),
        }) ?? '';

    return (
        <Card className="font-body w-full max-w-250 gap-0 rounded-xl bg-card/90 py-3 shadow-[var(--shadow-panel)] backdrop-blur-md">
            <CardContent className="flex flex-col gap-2 px-3">
                <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                        Sign text
                    </span>
                    <CharCount count={signText.length} limit={SIGN_CHAR_LIMIT} className="text-xs" />
                </div>
                <pre className="min-h-10 w-full whitespace-pre-wrap break-words rounded-lg border border-border bg-muted px-3 py-2 font-mono text-[0.75rem] text-foreground">
                    {signText}
                </pre>
                <CopyButton value={signText} disabled={signText.length === 0} className="self-end" />
            </CardContent>
        </Card>
    );
};
