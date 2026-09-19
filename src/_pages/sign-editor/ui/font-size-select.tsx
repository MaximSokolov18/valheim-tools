'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { ChevronDown } from 'lucide-react';
import { useEditorState } from '@tiptap/react';
import { useSignEditor } from '../model';
import {
    FONT_SIZE_PRESETS,
    parseFontSize,
    resolveActiveFontSize,
    setFontSize,
    clearFontSize,
} from '../lib';

/**
 * Word-style font-size control for the toolbar. The trigger shows the size that
 * covers the whole selection (blank when sizes are mixed, per `resolveActiveFontSize`).
 * The popover holds a free px input (applied on Enter, clamped by `setFontSize`),
 * a "Normal" entry that removes the size, and the preset ladder. Like the Bold
 * button it prevents mousedown default so opening it does not collapse the
 * editor selection.
 */
export const FontSizeSelect = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');

    const activeSize =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? resolveActiveFontSize(editor) : null),
        }) ?? null;

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setDraft(activeSize == null ? '' : String(activeSize));
        }
        setOpen(next);
    };

    const commitDraft = () => {
        if (!editor) return;
        const parsed = parseFontSize(draft);
        if (parsed == null) {
            return;
        }
        setFontSize(editor, parsed);
        setOpen(false);
    };

    const applyPreset = (px: number) => {
        if (!editor) return;
        setFontSize(editor, px);
        setOpen(false);
    };

    const applyNormal = () => {
        if (!editor) return;
        clearFontSize(editor);
        setOpen(false);
    };

    const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger
                aria-label={activeSize == null ? 'Font size' : `Font size: ${activeSize}`}
                onMouseDown={preventFocusSteal}
                className="flex items-center gap-1 h-7 min-w-14 rounded-[calc(var(--radius-md)-2px)] px-2 text-xs font-bold outline-hidden select-none hover:bg-muted aria-expanded:bg-muted"
            >
                <span className="min-w-4 text-center tabular-nums">{activeSize ?? '–'}</span>
                <ChevronDown className="size-3" aria-hidden />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={6} align="start">
                    <Popover.Popup
                        aria-label="Font size options"
                        className="flex max-h-64 w-24 flex-col overflow-y-auto rounded-md border bg-popover p-1 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <input
                            aria-label="Custom font size"
                            inputMode="numeric"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitDraft();
                                }
                            }}
                            className="mb-1 w-full rounded-sm border px-2 py-1 tabular-nums outline-hidden"
                        />
                        <button
                            type="button"
                            onMouseDown={preventFocusSteal}
                            onClick={applyNormal}
                            aria-pressed={activeSize == null}
                            className="rounded-sm px-2 py-1 text-left hover:bg-muted aria-pressed:bg-primary/90 aria-pressed:text-primary-foreground"
                        >
                            Normal
                        </button>
                        {FONT_SIZE_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onMouseDown={preventFocusSteal}
                                onClick={() => applyPreset(preset)}
                                aria-pressed={activeSize === preset}
                                className="rounded-sm px-2 py-1 text-left tabular-nums hover:bg-muted aria-pressed:bg-primary/90 aria-pressed:text-primary-foreground"
                            >
                                {preset}
                            </button>
                        ))}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
