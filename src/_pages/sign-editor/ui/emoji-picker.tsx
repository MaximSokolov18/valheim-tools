'use client';

import { Popover } from '@base-ui/react/popover';
import { useSignEditor } from '../model';
import { EMOJI_CATEGORIES, insertEmoji } from '../lib';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/**
 * Emoji picker for the toolbar: a categorized grid of default emoji (see
 * `lib/emoji.ts`) that insert at the caret on click. Unlike TextColorPicker,
 * there's no live-preview state to roll back — each click is a single,
 * immediate, permanent edit — so clicking an emoji does not close the
 * popover, letting several be inserted in a row before dismissing it.
 */
export const EmojiPicker = () => {
    const editor = useSignEditor();

    const handlePick = (char: string) => {
        if (!editor) return;
        insertEmoji(editor, char);
    };

    return (
        <Popover.Root>
            <Popover.Trigger
                aria-label="Insert emoji"
                onMouseDown={preventFocusSteal}
                className="flex h-7 min-w-7 items-center justify-center rounded-[calc(var(--radius-md)-2px)] px-1.5 text-base outline-hidden select-none bg-control text-control-foreground transition-colors hover:bg-control-hover aria-expanded:bg-control-active aria-expanded:text-control-active-foreground font-[family-name:var(--font-noto-emoji)]"
            >
                <span aria-hidden>😀</span>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={6} align="start">
                    <Popover.Popup
                        aria-label="Emoji options"
                        className="flex max-h-80 w-72 flex-col gap-3 overflow-y-auto rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md outline-hidden"
                    >
                        {EMOJI_CATEGORIES.map((category) => (
                            <div key={category.label} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    {category.label}
                                </span>
                                <div className="grid grid-cols-7 gap-1">
                                    {category.emoji.map((option) => (
                                        <button
                                            key={option.char}
                                            type="button"
                                            aria-label={option.label}
                                            onMouseDown={preventFocusSteal}
                                            onClick={() => handlePick(option.char)}
                                            className="flex aspect-square items-center justify-center rounded-sm border border-border text-base outline-hidden hover:bg-control-hover font-[family-name:var(--font-noto-emoji)]"
                                        >
                                            {option.char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
};
