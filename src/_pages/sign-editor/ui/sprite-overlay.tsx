'use client';

import { Fragment, useCallback, useEffect, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import { useSignEditor } from '../model';
import { spriteStyle } from '../lib';
import { BORDER_ID } from './constants';

interface PlacedSprite {
    key: number;
    index: number;
    left: number;
    top: number;
    size: number;
    selected: boolean;
}

/**
 * Draws the sign's `<sprite=N>` graphics above the board.
 *
 * The board runs the whole text area through the in-game color matrix, which
 * only models tinted *text* and would turn the sprites orange and dull. In the
 * game sprites are not tinted that way, so the editor keeps each sprite as an
 * invisible, same-sized placeholder (for layout, caret and selection) and this
 * overlay paints the real picture on top, outside the filter.
 */
export const SpriteOverlay = ({
    visible,
    editor: editorProp,
    boardRef,
}: {
    visible: boolean;
    /** A read-only board's own editor; the sign editor's shared instance by default. */
    editor?: Editor | null;
    /** That board's element; the sign editor's board by default. */
    boardRef?: RefObject<HTMLElement | null>;
}) => {
    const sharedEditor = useSignEditor();
    const editor = editorProp ?? sharedEditor;
    const getBoard = useCallback(() => boardRef?.current ?? document.getElementById(BORDER_ID), [boardRef]);
    const [sprites, setSprites] = useState<PlacedSprite[]>([]);

    const measure = useCallback(() => {
        const board = getBoard();
        if (!editor || editor.isDestroyed || !board) return;
        const origin = board.getBoundingClientRect();
        // The invisible placeholders show no native selection highlight, so the
        // overlay marks the selected ones itself.
        const { from, to } = editor.state.selection;
        const positions: number[] = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'sprite') positions.push(pos);
        });
        const placed = Array.from(editor.view.dom.querySelectorAll<HTMLElement>('[data-sprite]')).map(
            (element, key) => {
                const rect = element.getBoundingClientRect();
                const pos = positions[key];
                return {
                    key,
                    index: Number(element.dataset.sprite),
                    left: rect.left - origin.left,
                    // The placeholder is as wide as a sprite but as tall as the font's line box; center the picture in it.
                    top: rect.top - origin.top + (rect.height - rect.width) / 2,
                    size: rect.width,
                    selected: pos != null && pos >= from && pos + 1 <= to,
                };
            },
        );
        setSprites((previous) =>
            previous.length === placed.length &&
            previous.every((p, i) => JSON.stringify(p) === JSON.stringify(placed[i]))
                ? previous
                : placed,
        );
    }, [editor, getBoard]);

    useEffect(() => {
        if (!editor) return;
        let frame = 0;
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(schedule);
        const board = getBoard();
        if (board) observer.observe(board);
        observer.observe(editor.view.dom);
        editor.on('update', schedule);
        editor.on('transaction', schedule);
        window.addEventListener('resize', schedule);
        schedule();
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            editor.off('update', schedule);
            editor.off('transaction', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, [editor, measure, getBoard]);

    // Font-size changes resize the placeholders without resizing the editor box; re-measure after every paint of a change.
    useEffect(() => {
        if (!editor) return;
        const observer = new ResizeObserver(() => requestAnimationFrame(measure));
        editor.view.dom.querySelectorAll('[data-sprite]').forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [editor, measure, sprites.length]);

    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            {sprites.map((sprite) => (
                <Fragment key={sprite.key}>
                    {/* A sibling, not a child: the sprite's glow filter would smear the tint. */}
                    {sprite.selected && (
                        <span
                            className="absolute"
                            style={{
                                left: sprite.left,
                                top: sprite.top,
                                width: sprite.size,
                                height: sprite.size,
                                backgroundColor: 'color-mix(in oklab, var(--primary) 35%, transparent)',
                            }}
                        />
                    )}
                    <span
                        data-sprite-overlay={sprite.index}
                        className="absolute"
                        style={{
                            ...overlayStyle(sprite.index),
                            left: sprite.left,
                            top: sprite.top,
                            width: sprite.size,
                            height: sprite.size,
                        }}
                    />
                </Fragment>
            ))}
        </div>
    );
};

/** Sprites glow on the in-game sign: a touch brighter and paler than the raw atlas. */
const SPRITE_GLOW = 'brightness(1.3) saturate(0.8) drop-shadow(0 0 4px rgba(255, 244, 170, 0.9)) drop-shadow(0 0 12px rgba(255, 225, 100, 0.75)) drop-shadow(0 0 24px rgba(255, 210, 80, 0.5))';

const overlayStyle = (index: number): React.CSSProperties => ({
    ...Object.fromEntries(
        spriteStyle(index)
            .split(';')
            .filter((rule) => !/^(display|width|height|vertical-align)/.test(rule))
            .map((rule) => {
                const [prop, ...value] = rule.split(':');
                return [prop.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()), value.join(':')];
            }),
    ),
    filter: SPRITE_GLOW,
});
