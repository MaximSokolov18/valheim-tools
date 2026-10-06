'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { cn } from '../../../../lib/utils';
import { IMAGES } from '../../../shared/config/images';
import { createSignEditorExtensions, GAME_COLOR_FILTER } from '../lib';
import { SIGN_TEXT_ATTRIBUTES } from '../model';
import { BOARD_TEXT_AREA_CLASS } from './constants';
import { SpriteOverlay } from './sprite-overlay';
import { useAutoFitFontSize } from './use-auto-fit-font-size';

/** Starts drawing a board this far before it scrolls into view. */
const PRELOAD_MARGIN = '200px';

/** True once the element has come near the viewport; stays true. */
const useNearViewport = (ref: RefObject<HTMLElement | null>): boolean => {
    const [near, setNear] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (near || !element) return;
        if (typeof IntersectionObserver === 'undefined') {
            // No observer (old browser, tests): draw it on the next frame.
            const frame = requestAnimationFrame(() => setNear(true));
            return () => cancelAnimationFrame(frame);
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) setNear(true);
            },
            { rootMargin: PRELOAD_MARGIN },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, near]);
    return near;
};

/** The sign's text, laid out by a read-only editor with the sign editor's own extensions. */
function BoardText({ doc, boardRef }: { doc: JSONContent; boardRef: RefObject<HTMLDivElement | null> }) {
    const extensions = useMemo(() => createSignEditorExtensions(), []);
    const editor = useEditor({
        extensions,
        content: doc,
        editable: false,
        immediatelyRender: false,
        editorProps: { attributes: { ...SIGN_TEXT_ATTRIBUTES } },
    });
    // A saved sign can change (saved again, or in another tab): redraw it.
    useEffect(() => {
        if (editor && !editor.isDestroyed) editor.commands.setContent(doc, { emitUpdate: true });
    }, [editor, doc]);

    const areaRef = useRef<HTMLDivElement>(null);
    useAutoFitFontSize(editor, areaRef, { fitToScreen: false });

    return (
        <>
            <div ref={areaRef} className={cn(BOARD_TEXT_AREA_CLASS, 'pointer-events-none')} style={{ filter: GAME_COLOR_FILTER }}>
                <EditorContent editor={editor} className="w-full" />
            </div>
            <SpriteOverlay visible editor={editor} boardRef={boardRef} />
        </>
    );
}

/**
 * A saved sign drawn exactly as the editor draws it: the same board art, text
 * box, auto-fit, sizes, offsets and sprites, just smaller (text scales with the
 * board). Decorative, since the sign's name and markup sit next to it. It uses
 * the game-color filter the editor's board defines, so it belongs on that page.
 */
export function SignBoardView({ doc, className }: { doc: JSONContent; className?: string }) {
    const boardRef = useRef<HTMLDivElement>(null);
    const near = useNearViewport(boardRef);

    return (
        <div
            ref={boardRef}
            aria-hidden="true"
            className={cn('relative flex aspect-2/1 w-full items-center justify-center select-none', className)}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={IMAGES.editorBoard}
                alt=""
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_6px_8px_rgba(40,22,8,0.45)]"
            />
            {near && <BoardText doc={doc} boardRef={boardRef} />}
        </div>
    );
}
