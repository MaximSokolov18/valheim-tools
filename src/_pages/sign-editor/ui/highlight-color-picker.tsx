'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { Highlighter } from 'lucide-react';
import { useSignEditor } from '../model';
import {
    TEXT_COLOR_PRESETS,
    normalizeHexColor,
    setHighlightColor,
    clearHighlightColor,
} from '../lib';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/**
 * Toolbar control for the background highlight (`<mark>`): preset swatches,
 * a hex input and a "None" button. The trigger underline shows the highlight
 * covering the selection, if any. Like the other toolbar controls it prevents
 * mousedown default so opening it keeps the editor selection.
 */
export const HighlightColorPicker = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');

    const activeHighlight =
        useEditorState({
            editor,
            selector: ({ editor }) => {
                const raw = editor?.getAttributes('textStyle').backgroundColor as string | undefined;
                return raw == null ? null : normalizeHexColor(raw);
            },
        }) ?? null;

    const apply = (hex: string) => {
        if (!editor) return;
        setHighlightColor(editor, hex);
        setOpen(false);
    };

    const commitDraft = () => {
        const trimmed = draft.trim();
        if (normalizeHexColor(trimmed) != null) apply(trimmed);
    };

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                if (next) setDraft(activeHighlight ?? '');
                setOpen(next);
            }}
        >
            <Popover.Trigger
                aria-label={activeHighlight == null ? 'Highlight color' : `Highlight color: ${activeHighlight}`}
                onMouseDown={preventFocusSteal}
                className="flex flex-col items-center justify-center gap-0.5 h-7 min-w-7 rounded-[calc(var(--radius-md)-2px)] px-1.5 outline-hidden select-none bg-control text-control-foreground transition-colors hover:bg-control-hover aria-expanded:bg-control-active aria-expanded:text-control-active-foreground"
            >
                <Highlighter aria-hidden className="size-4" />
                <span
                    aria-hidden
                    className="h-1 w-4 rounded-sm border border-border"
                    style={{ backgroundColor: activeHighlight ?? 'transparent' }}
                />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={6} align="start">
                    <Popover.Popup
                        aria-label="Highlight color options"
                        className="flex w-48 flex-col gap-2 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <div className="grid grid-cols-4 gap-1">
                            {TEXT_COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.hex}
                                    type="button"
                                    aria-label={`Highlight ${preset.label}`}
                                    aria-pressed={activeHighlight === preset.hex}
                                    onMouseDown={preventFocusSteal}
                                    onClick={() => apply(preset.hex)}
                                    className="aspect-square rounded-sm border border-border outline-hidden aria-pressed:ring-2 aria-pressed:ring-primary"
                                    style={{ backgroundColor: preset.hex }}
                                />
                            ))}
                        </div>
                        <input
                            aria-label="Custom highlight color"
                            value={draft}
                            placeholder="#rrggbb"
                            onFocus={(event) => event.target.select()}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitDraft();
                                }
                            }}
                            className="w-full rounded-sm border px-2 py-1 outline-hidden"
                        />
                        <button
                            type="button"
                            onMouseDown={preventFocusSteal}
                            onClick={() => {
                                if (editor) clearHighlightColor(editor);
                                setOpen(false);
                            }}
                            className="rounded-sm bg-control text-[22px] px-2 py-1 text-control-foreground hover:bg-control-hover"
                        >
                            None
                        </button>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
