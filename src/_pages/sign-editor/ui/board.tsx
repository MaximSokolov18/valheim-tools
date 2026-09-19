'use client';

import { useRef, type MouseEvent } from 'react';
import { EditorContent } from '@tiptap/react';
import { useSignEditor } from '../model';
import { resolveClickSelection } from '../lib';
import { BORDER_ID } from './constants';
import { useAutoFitFontSize } from './use-auto-fit-font-size';

export const Board = () => {
    const editor = useSignEditor();
    const textAreaRef = useRef<HTMLDivElement>(null);
    useAutoFitFontSize(editor, textAreaRef);

    const handleBoardClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!editor) return;
        if (event.target instanceof Node && editor.view.dom.contains(event.target)) {
            return;
        }
        const pos = resolveClickSelection(editor, { left: event.clientX, top: event.clientY });
        editor.chain().focus().setTextSelection(pos).run();
    };

    return (
        <div
            id={BORDER_ID}
            onClick={handleBoardClick}
            className="max-w-250 w-full aspect-2/1 bg-center relative flex items-center justify-center bg-[url(/images/board.png)] bg-no-repeat bg-contain"
        >
            <div
                ref={textAreaRef}
                className="w-[62%] h-[80%] p-[30px] flex flex-col justify-center overflow-hidden"
            >
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    );
};
