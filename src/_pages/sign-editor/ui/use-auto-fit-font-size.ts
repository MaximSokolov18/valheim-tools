import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import { computeAutoFitFontSize } from '../lib';

/** Floor for the auto-fit search; independent of the (unrelated, unused here) manual font-size mark. */
const AUTO_FIT_MIN_FONT_SIZE = 8;

/**
 * Keeps `containerRef`'s font size at the largest value that still fits its own box,
 * recomputing on every editor edit and whenever the container is resized.
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

        const applyFit = () => {
            const max = Math.max(container.clientWidth, container.clientHeight);
            const size = computeAutoFitFontSize({
                min: AUTO_FIT_MIN_FONT_SIZE,
                max,
                fits: (fontSizePx) => {
                    container.style.fontSize = `${fontSizePx}px`;
                    return (
                        container.scrollWidth <= container.clientWidth &&
                        container.scrollHeight <= container.clientHeight
                    );
                },
            });
            container.style.fontSize = `${size}px`;
        };

        applyFit();
        editor.on('update', applyFit);
        const observer = new ResizeObserver(applyFit);
        observer.observe(container);

        return () => {
            editor.off('update', applyFit);
            observer.disconnect();
        };
    }, [editor, containerRef]);
};
