'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { useSignEditor } from '../model';
import { TEXT_COLOR_PRESETS, resolveActiveColor, setTextColor, clearTextColor } from '../lib';

/**
 * Word-style text-color control for the toolbar. The trigger swatch shows the
 * color that covers the whole selection (a "no color" outline when colors are
 * mixed or unset, per `resolveActiveColor`). The popover holds an "Automatic"
 * entry that clears the color, a preset swatch grid, and a free hex input
 * committed on Enter. Like the Bold button and `FontSizeSelect` it prevents
 * mousedown default so opening it does not collapse the editor selection.
 */
export const TextColorPicker = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');

    const activeColor =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? resolveActiveColor(editor) : null),
        }) ?? null;

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setDraft(activeColor ?? '');
        }
        setOpen(next);
    };

    const commitDraft = () => {
        if (!editor) return;
        if (!setTextColor(editor, draft.trim())) {
            return;
        }
        setOpen(false);
    };

    const applyPreset = (hex: string) => {
        if (!editor) return;
        setTextColor(editor, hex);
        setOpen(false);
    };

    const applyAutomatic = () => {
        if (!editor) return;
        clearTextColor(editor);
        setOpen(false);
    };

    const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger
                aria-label={activeColor == null ? 'Text color' : `Text color: ${activeColor}`}
                onMouseDown={preventFocusSteal}
                className="flex flex-col items-center justify-center gap-0.5 h-7 min-w-7 rounded-[calc(var(--radius-md)-2px)] px-1.5 text-xs font-bold outline-hidden select-none hover:bg-muted aria-expanded:bg-muted"
            >
                <span aria-hidden>A</span>
                <span
                    aria-hidden
                    className="h-1 w-4 rounded-sm border border-border"
                    style={{ backgroundColor: activeColor ?? 'transparent' }}
                />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={6} align="start">
                    <Popover.Popup
                        aria-label="Text color options"
                        className="flex w-40 flex-col gap-2 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <button
                            type="button"
                            onMouseDown={preventFocusSteal}
                            onClick={applyAutomatic}
                            aria-pressed={activeColor == null}
                            className="rounded-sm px-2 py-1 text-left hover:bg-muted aria-pressed:bg-primary/90 aria-pressed:text-primary-foreground"
                        >
                            Automatic
                        </button>
                        <div className="grid grid-cols-4 gap-1">
                            {TEXT_COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.hex}
                                    type="button"
                                    aria-label={preset.label}
                                    aria-pressed={activeColor === preset.hex}
                                    onMouseDown={preventFocusSteal}
                                    onClick={() => applyPreset(preset.hex)}
                                    className="aspect-square rounded-sm border border-border outline-hidden aria-pressed:ring-2 aria-pressed:ring-primary"
                                    style={{ backgroundColor: preset.hex }}
                                />
                            ))}
                        </div>
                        <input
                            aria-label="Custom text color"
                            value={draft}
                            placeholder="#rrggbb"
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitDraft();
                                }
                            }}
                            className="w-full rounded-sm border px-2 py-1 outline-hidden"
                        />
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
