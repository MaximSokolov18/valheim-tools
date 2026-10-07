'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { Highlighter } from 'lucide-react';
import { recentColorsStore, useRecentColors, useSignEditor } from '../model';
import { HexColorField, PickerSection, SwatchRow } from './color-picker-parts';
import { useSelectionHighlight } from './use-selection-highlight';
import {
    TEXT_COLOR_PRESETS,
    normalizeHexColor,
    parseHexInput,
    setHighlightColor,
    clearHighlightColor,
} from '../lib';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/**
 * Toolbar control for the background highlight (`<mark>`): preset swatches,
 * recent custom colors, a labelled hex code field and a "No highlight" button. The trigger underline shows the highlight
 * covering the selection, if any. Like the other toolbar controls it prevents
 * mousedown default so opening it keeps the editor selection.
 */
export const HighlightColorPicker = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [draftInvalid, setDraftInvalid] = useState(false);
    const recentColors = useRecentColors('highlight');

    const activeHighlight =
        useEditorState({
            editor,
            selector: ({ editor }) => {
                const raw = editor?.getAttributes('textStyle').backgroundColor as string | undefined;
                return raw == null ? null : normalizeHexColor(raw);
            },
        }) ?? null;

    useSelectionHighlight(editor, open);

    const apply = (hex: string) => {
        if (!editor) return;
        setHighlightColor(editor, hex);
        recentColorsStore.remember('highlight', hex);
        setOpen(false);
    };

    const commitDraft = () => {
        const hex = parseHexInput(draft);
        if (hex == null) setDraftInvalid(true);
        else apply(hex);
    };

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                if (next) {
                    setDraft(activeHighlight ?? '');
                    setDraftInvalid(false);
                }
                setOpen(next);
            }}
        >
            <Popover.Trigger
                aria-label={activeHighlight == null ? 'Highlight color' : `Highlight color: ${activeHighlight}`}
                title="Highlight color"
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
                        className="flex w-64 flex-col gap-3 rounded-md border bg-popover p-3 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <PickerSection title="Colors">
                            <SwatchRow
                                colors={TEXT_COLOR_PRESETS}
                                activeColor={activeHighlight}
                                onPick={apply}
                                labelFor={(color) => `Highlight ${color.label}`}
                            />
                        </PickerSection>
                        {recentColors.length > 0 && (
                            <PickerSection title="Recent">
                                <SwatchRow
                                    colors={recentColors.map((hex) => ({ hex, label: hex }))}
                                    activeColor={activeHighlight}
                                    onPick={apply}
                                    labelFor={(color) => `Highlight recent color ${color.hex}`}
                                />
                            </PickerSection>
                        )}
                        <HexColorField
                            inputLabel="Custom highlight color"
                            value={draft}
                            previewColor={parseHexInput(draft)}
                            invalid={draftInvalid}
                            onChange={(value) => {
                                setDraft(value);
                                setDraftInvalid(false);
                            }}
                            onCommit={commitDraft}
                        />
                        <button
                            type="button"
                            onMouseDown={preventFocusSteal}
                            onClick={() => {
                                if (editor) clearHighlightColor(editor);
                                setOpen(false);
                            }}
                            className="h-7 rounded-sm bg-control px-2 text-xs font-medium text-control-foreground hover:bg-control-hover"
                        >
                            No highlight
                        </button>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
