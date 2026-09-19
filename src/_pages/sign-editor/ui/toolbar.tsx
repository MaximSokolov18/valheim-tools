'use client';

// import { FontSizeSelect } from './font-size-select';
import { TextColorPicker } from './text-color-picker';
import { ThemeToggle } from '../../../shared/ui';

export const Toolbar = () => {
    return (
        <div className="flex items-center gap-1 rounded-lg border p-1 w-full h-12">
            <TextColorPicker />
            {/*<FontSizeSelect />*/}
            <ThemeToggle className="ml-auto" />
        </div>
    );
};
