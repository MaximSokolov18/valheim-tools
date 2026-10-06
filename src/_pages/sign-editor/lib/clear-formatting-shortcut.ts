import { Extension } from '@tiptap/core';
import { clearFormatting } from './commands';

/**
 * Mod-\ clears formatting, the Google Docs shortcut (Word's Ctrl+Space is taken by input-source
 * switching / Spotlight on macOS). See `clearFormatting`.
 */
export const ClearFormattingShortcut = Extension.create({
    name: 'clearFormattingShortcut',
    addKeyboardShortcuts() {
        return {
            'Mod-\\': ({ editor }) => clearFormatting(editor),
        };
    },
});
