'use client';

import { useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { useSignEditor } from '../model';
import { useSelectionHighlight } from './use-selection-highlight';
import type { Editor } from '@tiptap/core';
import {
    OFFSET_PRESETS,
    parseOffset,
    parseHorizontalOffset,
    resolveActiveOffset,
    resolveActiveHorizontalOffset,
    setTextOffset,
    clearTextOffset,
    setHorizontalOffset,
    clearHorizontalOffset,
} from '../lib';

type OffsetAxis = 'vertical' | 'horizontal';

interface AxisControl {
    parse: (value: string) => number | null;
    resolve: (editor: Editor) => number | null;
    set: (editor: Editor, value: number) => boolean;
    clear: (editor: Editor) => boolean;
}

/** Vertical is `<voffset>`; horizontal is one signed value over both margins (`N` left margin, `-N` right margin). */
const AXES: Record<OffsetAxis, AxisControl> = {
    vertical: {
        parse: (value) => parseOffset('verticalOffset', value),
        resolve: (editor) => resolveActiveOffset(editor, 'verticalOffset'),
        set: (editor, value) => setTextOffset(editor, 'verticalOffset', value),
        clear: (editor) => clearTextOffset(editor, 'verticalOffset'),
    },
    horizontal: {
        parse: parseHorizontalOffset,
        resolve: resolveActiveHorizontalOffset,
        set: setHorizontalOffset,
        clear: clearHorizontalOffset,
    },
};

interface OffsetSelectProps {
    axis: OffsetAxis;
    /** Accessible name, e.g. "Vertical offset". */
    label: string;
    icon: ReactNode;
    /** Label of the entry that removes the value. */
    noneLabel: string;
}

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/**
 * Toolbar control for a per-run signed offset: `<voffset>` (vertical) or the margins (horizontal, `N` is
 * `<margin-left=N>` and `-N` is `<margin-right=N>`). Same shape as `FontSizeSelect`: the
 * trigger shows the value covering the selection (highlighted only while open), the popover has a free numeric input (applied on
 * Enter), an entry that removes the value, and the preset ladder. Mousedown is prevented so opening it
 * does not collapse the editor selection.
 */
export const OffsetSelect = ({ axis, label, icon, noneLabel }: OffsetSelectProps) => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    useSelectionHighlight(editor, open);
    const { parse, resolve, set, clear } = AXES[axis];

    const active =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? resolve(editor) : null),
        }) ?? null;

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setDraft(active == null ? '' : String(active));
        }
        setOpen(next);
    };

    const apply = (value: number) => {
        if (!editor) return;
        set(editor, value);
        setOpen(false);
    };

    const commitDraft = () => {
        const parsed = parse(draft);
        if (parsed != null) {
            apply(parsed);
        }
    };

    const applyNone = () => {
        if (!editor) return;
        clear(editor);
        setOpen(false);
    };

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger
                aria-label={active == null ? label : `${label}: ${active}`}
                onMouseDown={preventFocusSteal}
                className="flex items-center justify-center gap-1 h-7 min-w-8 rounded-[calc(var(--radius-md)-2px)] px-2 text-xs font-bold outline-hidden select-none bg-control text-control-foreground transition-colors hover:bg-control-hover aria-expanded:bg-control-active aria-expanded:text-control-active-foreground"
            >
                {icon}
                {active != null && <span className="tabular-nums">{active}</span>}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={6} align="start">
                    <Popover.Popup
                        aria-label={`${label} options`}
                        className="flex max-h-64 w-24 flex-col overflow-y-auto rounded-md border bg-popover p-1 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <input
                            aria-label={`Custom ${label.toLowerCase()}`}
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
                            onClick={applyNone}
                            aria-pressed={active == null}
                            className="rounded-sm px-2 py-1 text-left outline-hidden hover:bg-control-hover aria-pressed:bg-control-active aria-pressed:text-control-active-foreground"
                        >
                            {noneLabel}
                        </button>
                        {OFFSET_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onMouseDown={preventFocusSteal}
                                onClick={() => apply(preset)}
                                aria-pressed={active === preset}
                                className="rounded-sm px-2 py-1 text-left tabular-nums outline-hidden hover:bg-control-hover aria-pressed:bg-control-active aria-pressed:text-control-active-foreground"
                            >
                                {preset > 0 ? `+${preset}` : preset}
                            </button>
                        ))}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
