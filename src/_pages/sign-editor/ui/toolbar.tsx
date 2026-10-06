'use client';

import { TextColorPicker } from './text-color-picker';
import { HighlightColorPicker } from './highlight-color-picker';
import { FontSizeSelect } from './font-size-select';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import { OffsetSelect } from './offset-select';
import { EmojiPicker } from './emoji-picker';
import { FormatButtons } from './format-buttons';
import { ClearButtons } from './clear-buttons';

export const Toolbar = () => {
    return (
        <div className="relative z-10 flex w-full max-w-250 items-center gap-1 rounded-xl border border-border bg-card/90 p-1.5 h-12 shadow-[var(--shadow-panel)] backdrop-blur-md">
            <TextColorPicker />
            <HighlightColorPicker />
            <FormatButtons />
            <FontSizeSelect />
            <OffsetSelect
                axis="vertical"
                label="Vertical offset"
                icon={<ArrowUpDown className="size-4" aria-hidden />}
                noneLabel="None"
            />
            <OffsetSelect
                axis="horizontal"
                label="Horizontal offset"
                icon={<ArrowLeftRight className="size-4" aria-hidden />}
                noneLabel="None"
            />
            <EmojiPicker />
            <ClearButtons />
        </div>
    );
};
