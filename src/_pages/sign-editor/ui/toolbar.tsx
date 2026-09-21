'use client';

import { TextColorPicker } from './text-color-picker';

export const Toolbar = () => {
    return (
        <div className="flex w-full max-w-250 items-center gap-1 rounded-lg border p-1 h-12">
            <TextColorPicker />
        </div>
    );
};
