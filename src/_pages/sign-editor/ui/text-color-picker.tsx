'use client';

import {
    useId,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import { Popover } from '@base-ui/react/popover';
import { useEditorState } from '@tiptap/react';
import { recentColorsStore, useRecentColors, useSignEditor } from '../model';
import { HexColorField, PickerSection, SwatchRow } from './color-picker-parts';
import {
    TEXT_COLOR_PRESETS,
    DEFAULT_TEXT_COLOR,
    resolveActiveColor,
    parseHexInput,
    setTextColor,
    clearTextColor,
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
 * color that covers the whole selection — black by default, per
 * `resolveActiveColor` — or a "no color" outline when colors are mixed. The
 * popover holds preset swatches, the player's recent custom colors, a
 * saturation/value square and hue slider to drag, and a
 * labelled hex code field that live-previews as you type. Like
 * the Bold button and `FontSizeSelect` it prevents mousedown default so
 * opening it does not collapse the editor selection.
 */
export const TextColorPicker = () => {
    const editor = useSignEditor();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [draftInvalid, setDraftInvalid] = useState(false);
    const recentColors = useRecentColors('text');
    const defaultHintId = useId();
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

    // `nextHsv` is passed by the square/hue drags. Hex can't carry the hue of a
    // gray or black color, so rebuilding HSV from it would snap the hue slider
    // back to 0 mid-drag; only external colors (presets, typed hex) go through hexToHsv.

    /** Live-preview `hex` on the selection without creating an undo step. */
    const previewColor = (hex: string, nextHsv?: Hsv) => {
        if (!editor) return;
        beginPreview();
        setTextColorTransient(editor, hex);
        setDraft(hex);
        setHsv(nextHsv ?? hexToHsv(hex));
    };

    const applyColor = (hex: string, nextHsv?: Hsv) => {
        if (!editor) return;
        setTextColor(editor, hex);
        recentColorsStore.remember('text', hex);
        setDraft(hex);
        setHsv(nextHsv ?? hexToHsv(hex));
    };

    /**
     * Roll back any in-progress preview to the pre-preview color (transiently,
     * so that never becomes its own undo step) and reapply `hex` for real —
     * collapsing however many live preview updates happened (drag moves, or
     * keystrokes in the hex input) into a single undo step from the
     * pre-preview color to the one the user landed on.
     */
    const commitColor = (hex: string, nextHsv?: Hsv) => {
        if (!editor) return;
        rollBackPreview();
        applyColor(hex, nextHsv);
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
                commitColor(hsvToHex(hsv), hsv);
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
        setDraftInvalid(false);
        setHsv(hexToHsv(color));
        if (editor) showSelectionHighlight(editor);
        setOpen(true);
    };

    const commitDraft = () => {
        const hex = parseHexInput(draft);
        if (hex == null) {
            setDraftInvalid(true);
            return;
        }
        commitColor(hex);
        closePopover();
    };

    const changeDraft = (value: string) => {
        setDraft(value);
        setDraftInvalid(false);
        const hex = parseHexInput(value);
        if (hex != null) {
            beginPreview();
            if (editor) setTextColorTransient(editor, hex);
            setHsv(hexToHsv(hex));
        }
    };

    /** Drop the color tag: the text goes back to the default color. One undo step. */
    const applyDefault = () => {
        if (!editor) return;
        rollBackPreview();
        clearTextColor(editor);
        setDraft(DEFAULT_TEXT_COLOR);
        setHsv(hexToHsv(DEFAULT_TEXT_COLOR));
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
        const next = { h: hsv.h, s, v };
        previewColor(hsvToHex(next), next);
    };

    const updateFromHue = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!editor || !hueRef.current || !isDragging(event)) return;
        const rect = hueRef.current.getBoundingClientRect();
        const h = clamp01((event.clientX - rect.left) / rect.width) * 360;
        const next = { h, s: hsv.s, v: hsv.v };
        previewColor(hsvToHex(next), next);
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
        commitColor(hsvToHex(hsv), hsv);
    };

    const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger
                aria-label={activeColor == null ? 'Text color' : `Text color: ${activeColor}`}
                title="Text color"
                onMouseDown={preventFocusSteal}
                className="flex flex-col items-center justify-center gap-0.5 h-7 min-w-7 rounded-[calc(var(--radius-md)-2px)] px-1.5 text-xs font-bold outline-hidden select-none bg-control text-control-foreground transition-colors hover:bg-control-hover aria-expanded:bg-control-active aria-expanded:text-control-active-foreground"
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
                        className="flex w-64 flex-col gap-3 rounded-md border bg-popover p-3 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        <PickerSection title="Colors">
                            <SwatchRow colors={TEXT_COLOR_PRESETS} activeColor={activeColor} onPick={applyPreset} />
                            <button
                                type="button"
                                aria-describedby={defaultHintId}
                                onMouseDown={preventFocusSteal}
                                onClick={applyDefault}
                                className="mt-1 flex h-7 items-center gap-2 rounded-sm bg-control px-2 text-xs font-medium text-control-foreground hover:bg-control-hover focus-visible:ring-2 focus-visible:ring-ring outline-hidden"
                            >
                                <span
                                    aria-hidden
                                    className="size-4 rounded-sm border border-border"
                                    style={{ backgroundColor: DEFAULT_TEXT_COLOR }}
                                />
                                Default color
                                <span id={defaultHintId} className="ml-auto text-[0.6rem] font-normal text-muted-foreground">
                                    no color tag
                                </span>
                            </button>
                        </PickerSection>
                        {recentColors.length > 0 && (
                            <PickerSection title="Recent">
                                <SwatchRow
                                    colors={recentColors.map((hex) => ({ hex, label: hex }))}
                                    activeColor={activeColor}
                                    onPick={applyPreset}
                                    labelFor={(color) => `Recent color ${color.hex}`}
                                />
                            </PickerSection>
                        )}
                        <PickerSection title="Fine-tune">
                            <div
                                ref={squareRef}
                                aria-label="Saturation and brightness"
                                onMouseDown={preventFocusSteal}
                                onPointerDown={startSquareDrag}
                                onPointerMove={updateFromSquare}
                                onPointerUp={endDrag}
                                className="relative h-36 w-full cursor-crosshair touch-none rounded-sm border border-border select-none"
                                style={{
                                    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                                    backgroundImage:
                                        'linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent)',
                                }}
                            >
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                                    style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hsvToHex(hsv) }}
                                />
                            </div>
                            <div
                                ref={hueRef}
                                aria-label="Hue"
                                onMouseDown={preventFocusSteal}
                                onPointerDown={startHueDrag}
                                onPointerMove={updateFromHue}
                                onPointerUp={endDrag}
                                className="relative mt-1 h-4 w-full cursor-pointer touch-none rounded-sm border border-border select-none"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
                                }}
                            >
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute top-1/2 h-5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                                />
                            </div>
                        </PickerSection>
                        <HexColorField
                            inputLabel="Custom text color"
                            value={draft}
                            previewColor={parseHexInput(draft)}
                            invalid={draftInvalid}
                            onChange={changeDraft}
                            onCommit={commitDraft}
                        />
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
