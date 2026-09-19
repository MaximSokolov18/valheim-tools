import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const key = new PluginKey<boolean>('selectionHighlight');

/**
 * Focusing a plain form control (the color picker's hex input) collapses the
 * browser's native Selection, which erases the *visual* highlight on the
 * sign's selected text even though the editor's own `state.selection` is
 * untouched — the text looks deselected while a toolbar control has focus,
 * though commands still apply to the right range. This extension paints a
 * decoration over the selection instead, independent of DOM focus, for
 * exactly that window (toggled by `showSelectionHighlight`/
 * `hideSelectionHighlight` around the color picker's open state).
 */
export const SelectionHighlight = Extension.create({
    name: 'selectionHighlight',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key,
                state: {
                    init: () => false,
                    apply(tr, active) {
                        const meta = tr.getMeta(key);
                        return meta === undefined ? active : meta;
                    },
                },
                props: {
                    decorations(state) {
                        if (!key.getState(state)) {
                            return null;
                        }
                        const { from, to } = state.selection;
                        if (from === to) {
                            return null;
                        }
                        return DecorationSet.create(state.doc, [
                            Decoration.inline(from, to, { class: 'sign-editor-force-selection' }),
                        ]);
                    },
                },
            }),
        ];
    },
});

export const showSelectionHighlight = (editor: Editor): void => {
    editor.view.dispatch(editor.state.tr.setMeta(key, true));
};

export const hideSelectionHighlight = (editor: Editor): void => {
    editor.view.dispatch(editor.state.tr.setMeta(key, false));
};
