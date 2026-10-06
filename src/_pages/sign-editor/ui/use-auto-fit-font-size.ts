import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import {
    computeAutoFitFontSize,
    setLineShifts,
    measureLineShifts,
    maxLineMargins,
    AUTO_FIT_SIZE,
    MIN_AUTO_FIT_SIZE,
    SIZE_UNIT_PX,
    SIZE_UNIT_VAR,
    STAGE_TEXT_AREA_WIDTH,
} from '../lib';
import { BORDER_ID, BOARD_SCALE_VAR } from './constants';

/** The board never shrinks below this fraction of its full size, even for a `<size=9000>` glyph. */
const MIN_BOARD_SCALE = 0.0001;

/** Smallest size unsized text shrinks to when a `<voffset>` or a margin leaves no room for it (measured in game). */
const MIN_OFFSET_FIT_SIZE = 1;

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
    {
        fitToScreen = true,
    }: {
        /** Shrink the editor's board when big text would not fit on screen. Off for the read-only boards of saved signs. */
        fitToScreen?: boolean;
    } = {},
): void => {
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!editor || !container) {
            return;
        }

        /** Whether text pokes out of the editor's own box, i.e. the width the margins leave. */
        const overflowsWidth = () => editor.view.dom.scrollWidth > editor.view.dom.clientWidth;

        /** Lays the text out at the board's current size: size unit, auto-fit, line breaks, centering. */
        const layout = () => {
            setLineShifts(editor, []); // measure and fit without the previous layout's nudges
            // ...and without its margin padding, which can hold the box wider than a since-shrunk board allows.
            container.style.paddingLeft = '';
            container.style.paddingRight = '';
            // Pixels per `<size>` unit at the board's current width; sized text is absolute in this unit.
            // Fractional width: the rounded `clientWidth` is too coarse once a huge size has shrunk the board to a few px.
            const width = container.getBoundingClientRect().width || container.clientWidth;
            const unit = (SIZE_UNIT_PX * width) / STAGE_TEXT_AREA_WIDTH;
            container.style.setProperty(SIZE_UNIT_VAR, `${unit}px`);
            // Like the game, fit text into the width the margins leave. Padding the box does exactly that (and
            // centers lines in the rest); lines with other margins are nudged from there by the line shifts.
            // It is kept below the full width so the box itself never grows.
            const margins = maxLineMargins(editor.state.doc);
            let padLeft = margins.left * unit;
            let padRight = margins.right * unit;
            const room = Math.max(0, width - 2);
            if (padLeft + padRight > room) {
                const squeeze = room / (padLeft + padRight);
                padLeft *= squeeze;
                padRight *= squeeze;
            }
            container.style.paddingLeft = padLeft ? `${padLeft}px` : '';
            container.style.paddingRight = padRight ? `${padRight}px` : '';
            // Unsized text auto-fits but, like in game, never past what a lone character gets (size 8).
            const max = Math.max(1, Math.round(AUTO_FIT_SIZE * unit));
            // ...and never below the size the game leaves it at when sized text takes all the room.
            // A vertical offset grows its line and a margin narrows it; the game then shrinks unsized text further
            // (measured at about size 1 for both, e.g. `<margin-left=30>d`).
            const squeezed = margins.left + margins.right > 0 || container.querySelector('[style*="--sign-voffset"]');
            const floorSize = squeezed ? MIN_OFFSET_FIT_SIZE : MIN_AUTO_FIT_SIZE;
            const min = Math.min(max, Math.max(1, Math.round(floorSize * unit)));
            const fit = () =>
                computeAutoFitFontSize({
                    min,
                    max,
                    fits: (fontSizePx) => {
                        container.style.fontSize = `${fontSizePx}px`;
                        return (
                            !overflowsWidth() &&
                            container.scrollHeight <= container.clientHeight
                        );
                    },
                });
            // Lines only break at spaces, so shrinking is the first resort. If even the smallest unsized
            // text leaves the line too wide for the room the margins leave (big sized glyphs, or a margin wider
            // than the box), the game breaks it between characters: `<margin-right=30>md` puts m and d on two lines.
            container.removeAttribute('data-break');
            let size = fit();
            container.style.fontSize = `${size}px`;
            if (overflowsWidth()) {
                container.setAttribute('data-break', '');
                size = fit();
            }
            container.style.fontSize = `${size}px`;
            // Like in game, text wider than the box is not clipped. A line that is wider than the box (one
            // big glyph) would overflow only to the right, so nudge each such line to be centered on it.
            const rect = container.getBoundingClientRect();
            const box = {
                left: rect.left + padLeft,
                width: rect.width - padLeft - padRight,
                unit,
                baseNet: padLeft - padRight,
            };
            setLineShifts(editor, measureLineShifts(editor, box));
        };

        /** Farthest horizontal reach (px) of the drawn text, line shifts included, from the text box's center. */
        const textHalfWidth = (): number => {
            const rect = container.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            let reach = container.clientWidth / 2;
            // Shifts are `position: relative`, which `scrollWidth` does not see on the left, so measure the text itself.
            const range = document.createRange();
            range.selectNodeContents(editor.view.dom);
            if (typeof range.getBoundingClientRect === 'function') {
                const text = range.getBoundingClientRect();
                if (text.width > 0) {
                    reach = Math.max(reach, center - text.left, text.right - center);
                }
            }
            return reach;
        };

        /**
         * The board keeps its full size unless the sign — text overhang included — would not fit on screen.
         * Then the whole board (art and text together, so the symbol-to-board ratio is unchanged) shrinks
         * to the space between the toolbar and the copy panel. Returns whether the board size changed.
         */
        const fitBoardToScreen = (): boolean => {
            if (!fitToScreen) return false;
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
            // The board stays centered, so it needs twice the text's farthest reach from its center. That counts the
            // line shifts: a margin pushes a line past the sign's edge in game (`<margin-left=50>` lands about a board
            // width to the right), and the board shrinks to keep it in view.
            const neededWidth = 2 * textHalfWidth();
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
    }, [editor, containerRef, fitToScreen]);
};
