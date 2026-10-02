'use client';

import { TextColorPicker } from './text-color-picker';
import { HighlightColorPicker } from './highlight-color-picker';
import { EmojiPicker } from './emoji-picker';
import { FormatButtons } from './format-buttons';

export const Toolbar = () => {
    return (
        <div className="flex w-full max-w-250 items-center gap-1 rounded-lg border p-1 h-12">
            <TextColorPicker />
            <HighlightColorPicker />
            <FormatButtons />
            <EmojiPicker />
        </div>
    );
};
