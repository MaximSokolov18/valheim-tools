'use client';

import { useEditorState } from '@tiptap/react';
import { ToolbarButton } from './toolbar-button';
// import { FontSizeSelect } from './font-size-select';
import { TextColorPicker } from './text-color-picker';
import { useSignEditor } from '../model';
import { toggleBold } from '../lib';

export const Toolbar = () => {
    const editor = useSignEditor();

    const isBoldActive =
        useEditorState({
            editor,
            selector: ({ editor }) => editor?.isActive('bold') ?? false,
        }) ?? false;

    return (
        <div className="flex items-center gap-1 rounded-lg border p-1 w-full h-12">
            <ToolbarButton
                isActive={isBoldActive}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor && toggleBold(editor)}
            >
                B
            </ToolbarButton>
            <TextColorPicker />
            {/*<FontSizeSelect />*/}
        </div>
    );
};
