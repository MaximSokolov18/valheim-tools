import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import {
    computeAutoFitFontSize,
    setLineShifts,
    measureLineShifts,
    AUTO_FIT_SIZE,
    MIN_AUTO_FIT_SIZE,
    SIZE_UNIT_PX,
    SIZE_UNIT_VAR,
    STAGE_TEXT_AREA_WIDTH,
} from '../lib';
import { BORDER_ID, BOARD_SCALE_VAR } from './constants';

/** The board never shrinks below this fraction of its full size, even for a `<size=9000>` glyph. */
const MIN_BOARD_SCALE = 0.0001;

/** Space (px) kept free around the sign when fitting it to the screen. */
const STAGE_GUTTER = 48;

/** Most layout passes spent settling the board size in one update. */
const MAX_BOARD_PASSES = 8;

/**
 * Keeps `containerRef`'s font size at the largest value that still fits its own box,
 * recomputing on every editor edit, whenever the container is resized and after web fonts load.
 */
export const useAutoFitFontSize = (
    editor: Editor | null,
    containerRef: RefObject<HTMLElement | null>,
): void => {
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!editor || !container) {
            return;
        }

        /** Lays the text out at the board's current size: size unit, auto-fit, line breaks, centering. */
        const layout = () => {
            setLineShifts(editor, []); // measure and fit without the previous layout's nudges
            // Pixels per `<size>` unit at the board's current width; sized text is absolute in this unit.
            // Fractional width: the rounded `clientWidth` is too coarse once a huge size has shrunk the board to a few px.
            const width = container.getBoundingClientRect().width || container.clientWidth;
            const unit = (SIZE_UNIT_PX * width) / STAGE_TEXT_AREA_WIDTH;
            container.style.setProperty(SIZE_UNIT_VAR, `${unit}px`);
            // Unsized text auto-fits but, like in game, never past what a lone character gets (size 8).
            const max = Math.max(1, Math.round(AUTO_FIT_SIZE * unit));
            // ...and never below the size the game leaves it at when sized text takes all the room.
            const min = Math.min(max, Math.max(1, Math.round(MIN_AUTO_FIT_SIZE * unit)));
            const fit = () =>
                computeAutoFitFontSize({
                    min,
                    max,
                    fits: (fontSizePx) => {
                        container.style.fontSize = `${fontSizePx}px`;
                        return (
                            container.scrollWidth <= container.clientWidth &&
                            container.scrollHeight <= container.clientHeight
                        );
                    },
                });
            // Lines only break at spaces, so shrinking is the first resort. If even the smallest unsized
            // text leaves the line too wide (big sized glyphs), the game breaks it between characters.
            container.removeAttribute('data-break');
            let size = fit();
            container.style.fontSize = `${size}px`;
            if (container.scrollWidth > container.clientWidth) {
                container.setAttribute('data-break', '');
                size = fit();
            }
            container.style.fontSize = `${size}px`;
            // Like in game, text wider than the box is not clipped. A line that is wider than the box (one
            // big glyph) would overflow only to the right, so nudge each such line to be centered on it.
            const rect = container.getBoundingClientRect();
            setLineShifts(editor, measureLineShifts(editor, { left: rect.left, width: rect.width }));
        };

        /**
         * The board keeps its full size unless the sign — text overhang included — would not fit on screen.
         * Then the whole board (art and text together, so the symbol-to-board ratio is unchanged) shrinks
         * to the space between the toolbar and the copy panel. Returns whether the board size changed.
         */
        const fitBoardToScreen = (): boolean => {
            const board = document.getElementById(BORDER_ID);
            const stage = board?.parentElement;
            const content = container.firstElementChild;
            if (!board || !stage || !(content instanceof HTMLElement)) {
                return false;
            }
            const taken = Array.from(stage.children).reduce(
                (sum, child) =>
                    child === board || getComputedStyle(child).position === 'absolute'
                        ? sum
                        : sum + (child as HTMLElement).offsetHeight,
                0,
            );
            const availableHeight = stage.clientHeight - taken - STAGE_GUTTER;
            const availableWidth = stage.clientWidth - STAGE_GUTTER;
            const neededHeight = content.getBoundingClientRect().height;
            // Wide lines overhang evenly on both sides once centered, so the scroll overflow is only half of it.
            const neededWidth = container.clientWidth + 2 * Math.max(0, container.scrollWidth - container.clientWidth);
            if (availableHeight <= 0 || availableWidth <= 0 || neededHeight <= 0 || neededWidth <= 0) {
                return false;
            }
            const current = Number(board.style.getPropertyValue(BOARD_SCALE_VAR)) || 1;
            // Text size scales with the board, so the needed space is proportional to the current scale.
            const fitScale = current * Math.min(availableHeight / neededHeight, availableWidth / neededWidth);
            const next = Math.min(1, Math.max(MIN_BOARD_SCALE, fitScale));
            if (Math.abs(next - current) <= 0.005 * current) {
                return false;
            }
            board.style.setProperty(BOARD_SCALE_VAR, String(next));
            return true;
        };

        const applyFit = () => {
            layout();
            // Browsers clamp font sizes (~10000px), so a huge size can need a few passes to settle.
            for (let pass = 0; pass < MAX_BOARD_PASSES && fitBoardToScreen(); pass += 1) {
                layout();
            }
        };

        applyFit();
        editor.on('update', applyFit);
        const observer = new ResizeObserver(applyFit);
        observer.observe(container);

        // Web fonts swap in after first paint and change glyph widths without
        // resizing the (fixed-size) container, so refit once they have loaded.
        const fonts = document.fonts;
        fonts?.ready.then(applyFit).catch(() => {});
        fonts?.addEventListener?.('loadingdone', applyFit);

        return () => {
            editor.off('update', applyFit);
            observer.disconnect();
            fonts?.removeEventListener?.('loadingdone', applyFit);
        };
    }, [editor, containerRef]);
};
