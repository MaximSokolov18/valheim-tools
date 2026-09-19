'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { useSignEditor } from '../model';
import {
    TEXT_COLOR_PRESETS,
    DEFAULT_TEXT_COLOR,
    resolveActiveColor,
    normalizeHexColor,
    setTextColor,
    setTextColorTransient,
    unsetTextColorTransient,
    showSelectionHighlight,
    hideSelectionHighlight,
    hexToHsv,
    hsvToHex,
    type Hsv,
} from '../lib';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** `true` while the primary button is held during this pointer event. */
const isDragging = (event: ReactPointerEvent): boolean => (event.buttons & 1) === 1;

/**
 * Word-style text-color control for the toolbar. The trigger swatch shows the
 * color that covers the whole selection — white by default, per
 * `resolveActiveColor` — or a "no color" outline when colors are mixed. The
 * popover holds a preset swatch grid, a mouse-driven saturation/value square
 * and hue slider, and a free hex input that live-previews as you type. Like
 * the Bold button and `FontSizeSelect` it prevents mousedown default so
 * opening it does not collapse the editor selection.
 */
export const TextColorPicker = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(DEFAULT_TEXT_COLOR));
    const squareRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    /**
     * The raw (possibly unset) color attribute from just before the current
     * live preview (drag or hex typing) started — `undefined` when there is
     * no preview in progress. Distinct from `null`, which means "no explicit
     * color was set".
     */
    const previewBaselineRef = useRef<string | null | undefined>(undefined);

    const activeColor =
        useEditorState({
            editor,
            selector: ({ editor }) => (editor ? resolveActiveColor(editor) : null),
        }) ?? null;

    /** Start (or continue) a live preview: remembers what to roll back to. */
    const beginPreview = () => {
        if (!editor || previewBaselineRef.current !== undefined) return;
        previewBaselineRef.current = (editor.getAttributes('textStyle').color as string | undefined) ?? null;
    };

    /** Roll the document back to the pre-preview color, transiently (no undo step). */
    const rollBackPreview = () => {
        if (!editor || previewBaselineRef.current === undefined) return;
        const baseline = previewBaselineRef.current;
        if (baseline == null) {
            unsetTextColorTransient(editor);
        } else {
            setTextColorTransient(editor, baseline);
        }
        previewBaselineRef.current = undefined;
    };

    /** Live-preview `hex` on the selection without creating an undo step. */
    const previewColor = (hex: string) => {
        if (!editor) return;
        beginPreview();
        setTextColorTransient(editor, hex);
        setDraft(hex);
        setHsv(hexToHsv(hex));
    };

    const applyColor = (hex: string) => {
        if (!editor) return;
        setTextColor(editor, hex);
        setDraft(hex);
        setHsv(hexToHsv(hex));
    };

    /**
     * Roll back any in-progress preview to the pre-preview color (transiently,
     * so that never becomes its own undo step) and reapply `hex` for real —
     * collapsing however many live preview updates happened (drag moves, or
     * keystrokes in the hex input) into a single undo step from the
     * pre-preview color to the one the user landed on.
     */
    const commitColor = (hex: string) => {
        if (!editor) return;
        rollBackPreview();
        applyColor(hex);
    };

    // The hex input needs real DOM focus to be typeable, which collapses the
    // browser's native Selection and erases the visual highlight on the
    // sign's selected text — even though the editor's own selection is
    // untouched underneath. This decoration keeps it visibly selected for as
    // long as the popover (and thus the input) can hold focus, so every path
    // that closes the popover goes through `closePopover` to turn it back off.
    const closePopover = () => {
        if (editor) {
            // Closing the popover — via Escape, clicking outside, or a commit
            // path that already ran — keeps whatever's currently previewed,
            // the same as pressing Enter would. `hsv` tracks the last *valid*
            // preview even if the draft has since been typed into something
            // invalid, so this never commits garbage. A no-op (nothing to
            // roll back) once a commit path already ran first.
            if (previewBaselineRef.current !== undefined) {
                commitColor(hsvToHex(hsv));
            }
            hideSelectionHighlight(editor);
        }
        setOpen(false);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            closePopover();
            return;
        }
        const color = activeColor ?? DEFAULT_TEXT_COLOR;
        setDraft(color);
        setHsv(hexToHsv(color));
        if (editor) showSelectionHighlight(editor);
        setOpen(true);
    };

    const commitDraft = () => {
        const trimmed = draft.trim();
        if (normalizeHexColor(trimmed) == null) {
            return;
        }
        commitColor(trimmed);
        closePopover();
    };

    const applyPreset = (hex: string) => {
        commitColor(hex);
        closePopover();
    };

    const updateFromSquare = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!editor || !squareRef.current || !isDragging(event)) return;
        const rect = squareRef.current.getBoundingClientRect();
        const s = clamp01((event.clientX - rect.left) / rect.width) * 100;
        const v = (1 - clamp01((event.clientY - rect.top) / rect.height)) * 100;
        previewColor(hsvToHex({ h: hsv.h, s, v }));
    };

    const updateFromHue = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!editor || !hueRef.current || !isDragging(event)) return;
        const rect = hueRef.current.getBoundingClientRect();
        const h = clamp01((event.clientX - rect.left) / rect.width) * 360;
        previewColor(hsvToHex({ h, s: hsv.s, v: hsv.v }));
    };

    const startSquareDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        updateFromSquare(event);
    };

    const startHueDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        updateFromHue(event);
    };

    const endDrag = () => {
        commitColor(hsvToHex(hsv));
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
                        className="flex w-48 flex-col gap-2 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
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
                        <div
                            ref={squareRef}
                            aria-label="Saturation and brightness"
                            onMouseDown={preventFocusSteal}
                            onPointerDown={startSquareDrag}
                            onPointerMove={updateFromSquare}
                            onPointerUp={endDrag}
                            className="relative h-28 w-full touch-none rounded-sm border border-border select-none"
                            style={{
                                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                                backgroundImage:
                                    'linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent)',
                            }}
                        >
                            <span
                                aria-hidden
                                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
                            />
                        </div>
                        <div
                            ref={hueRef}
                            aria-label="Hue"
                            onMouseDown={preventFocusSteal}
                            onPointerDown={startHueDrag}
                            onPointerMove={updateFromHue}
                            onPointerUp={endDrag}
                            className="relative h-3 w-full touch-none rounded-sm border border-border select-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
                            }}
                        >
                            <span
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 h-4 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow"
                                style={{ left: `${(hsv.h / 360) * 100}%` }}
                            />
                        </div>
                        <input
                            aria-label="Custom text color"
                            value={draft}
                            placeholder="#rrggbb"
                            onFocus={(event) => event.target.select()}
                            onChange={(event) => {
                                const value = event.target.value;
                                setDraft(value);
                                if (normalizeHexColor(value.trim()) != null) {
                                    previewColor(value.trim());
                                }
                            }}
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
