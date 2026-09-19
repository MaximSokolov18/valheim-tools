'use client';

import { useRef, type MouseEvent } from 'react';
import { EditorContent } from '@tiptap/react';
import { useSignEditor } from '../model';
import { resolveClickSelection } from '../lib';
import { BORDER_ID } from './constants';
import { useAutoFitFontSize } from './use-auto-fit-font-size';

/**
 * Beyond this many pixels of movement between mousedown and the trailing
 * click, a gesture counts as a drag rather than a stationary click.
 */
const CLICK_DRAG_THRESHOLD_PX = 5;

export const Board = () => {
    const editor = useSignEditor();
    const textAreaRef = useRef<HTMLDivElement>(null);
    useAutoFitFontSize(editor, textAreaRef);
    // A text-selection drag can start inside the editor and end with the
    // mouseup (and thus `click`) landing on the board outside it — e.g. the
    // pointer slid past the text onto the wood before the button came up —
    // or it can start on the wood itself (see handleBoardMouseDown) and end
    // there too. Either way, the trailing click must not collapse whatever
    // selection the drag produced; only a click that neither started inside
    // the editor nor moved is a genuine "place the caret here" click.
    const mouseDownInEditorRef = useRef(false);
    const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

    const handleBoardMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (!editor) return;
        mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
        const insideEditor = event.target instanceof Node && editor.view.dom.contains(event.target);
        mouseDownInEditorRef.current = insideEditor;
        if (insideEditor) return;

        // The bare wood/padding around the text has no character under the
        // pointer, so the browser has no DOM position to anchor a selection
        // to there. Starting a drag on it and moving into the text never
        // selects anything natively — worse, the browser's own default
        // mousedown handling actively clears focus/selection when it can't
        // resolve one, which would stomp anything we set here unless we
        // preempt it with `preventDefault`. So this gesture is taken over
        // entirely: the anchor is placed at the nearest text boundary (the
        // same place a stationary click here would land it), and for as
        // long as the button stays down, mousemove drives the extending end
        // of the selection ourselves — standing in for the native
        // drag-to-extend behavior that has no starting point to work from.
        event.preventDefault();
        const anchor = resolveClickSelection(editor, { left: event.clientX, top: event.clientY });
        editor.chain().focus().setTextSelection(anchor).run();

        const handleMove = (moveEvent: globalThis.MouseEvent) => {
            if (editor.isDestroyed) return;
            const head = resolveClickSelection(editor, { left: moveEvent.clientX, top: moveEvent.clientY });
            editor.commands.setTextSelection({ from: anchor, to: head });
        };
        const stopDragging = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', stopDragging);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', stopDragging);
    };

    const handleBoardClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!editor) return;
        if (mouseDownInEditorRef.current) return;
        const start = mouseDownPosRef.current;
        if (start) {
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (dx * dx + dy * dy > CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX) {
                return;
            }
        }
        if (event.target instanceof Node && editor.view.dom.contains(event.target)) {
            return;
        }
        const pos = resolveClickSelection(editor, { left: event.clientX, top: event.clientY });
        editor.chain().focus().setTextSelection(pos).run();
    };

    return (
        <div
            id={BORDER_ID}
            onMouseDown={handleBoardMouseDown}
            onClick={handleBoardClick}
            className="max-w-250 w-full aspect-2/1 bg-center relative flex items-center justify-center bg-[url(/images/board.png)] bg-no-repeat bg-contain"
        >
            <div
                ref={textAreaRef}
                className="w-[62%] h-[80%] p-[30px] flex flex-col justify-center overflow-hidden text-white"
            >
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    );
};
