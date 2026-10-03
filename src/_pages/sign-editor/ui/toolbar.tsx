'use client';

import { TextColorPicker } from './text-color-picker';
import { HighlightColorPicker } from './highlight-color-picker';
import { EmojiPicker } from './emoji-picker';
import { FormatButtons } from './format-buttons';

export const Toolbar = () => {
    return (
        <div className="flex w-full max-w-250 items-center gap-1 rounded-xl border border-border bg-card/90 p-1.5 h-12 shadow-[var(--shadow-panel)] backdrop-blur-md">
            <TextColorPicker />
            <HighlightColorPicker />
            <FormatButtons />
            <EmojiPicker />
        </div>
    );
};
