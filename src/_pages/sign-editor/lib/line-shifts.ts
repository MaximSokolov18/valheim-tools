import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/** A document range to nudge sideways by `shift` px (a line that is wider than the sign box). */
export interface LineShift {
    from: number;
    to: number;
    shift: number;
}

const lineShiftsKey = new PluginKey<LineShift[]>('lineShifts');

/**
 * A line wider than the text box (a single big glyph) is start-aligned by CSS and overflows only to the
 * right, while the game centers every line on the sign. This draws those lines shifted by the amount
 * `measureLineShifts` worked out — purely visual (`position: relative`), so layout and wrapping are
 * untouched. Shifts describe one layout, so any document change clears them until they are measured again.
 */
export const LineShifts = Extension.create({
    name: 'lineShifts',
    addProseMirrorPlugins() {
        return [
            new Plugin<LineShift[]>({
                key: lineShiftsKey,
                state: {
                    init: () => [],
                    apply: (tr, shifts) => {
                        const next = tr.getMeta(lineShiftsKey) as LineShift[] | undefined;
                        if (next) {
                            return next;
                        }
                        return tr.docChanged ? [] : shifts;
                    },
                },
                props: {
                    decorations: (state) => {
                        const shifts = lineShiftsKey.getState(state) ?? [];
                        return DecorationSet.create(
                            state.doc,
                            shifts.map(({ from, to, shift }) =>
                                Decoration.inline(from, to, { style: `position: relative; left: ${shift}px` }),
                            ),
                        );
                    },
                },
            }),
        ];
    },
});

/** Replaces the drawn line shifts (pass `[]` to clear them before measuring a fresh layout). */
export const setLineShifts = (editor: Editor, shifts: LineShift[]): void => {
    if (editor.isDestroyed) {
        return;
    }
    const current = lineShiftsKey.getState(editor.state) ?? [];
    if (current.length === 0 && shifts.length === 0) {
        return;
    }
    editor.view.dispatch(editor.state.tr.setMeta(lineShiftsKey, shifts).setMeta('addToHistory', false));
};

/**
 * Finds the rendered lines wider than `box` and how far each must move to be centered on it.
 * Measure with no shifts applied. Returns `[]` where the browser cannot report text geometry (jsdom).
 */
export const measureLineShifts = (editor: Editor, box: { left: number; width: number }): LineShift[] => {
    const { view, state } = editor;
    const boxCenter = box.left + box.width / 2;
    const shifts: LineShift[] = [];

    try {
        state.doc.forEach((paragraph, paragraphOffset) => {
            let line: { from: number; to: number; left: number; right: number } | null = null;
            const flush = () => {
                if (line && line.right - line.left > box.width + 1) {
                    shifts.push({
                        from: line.from,
                        to: line.to,
                        shift: boxCenter - (line.left + line.right) / 2,
                    });
                }
                line = null;
            };
            const addGlyph = (from: number, to: number) => {
                const start = view.coordsAtPos(from, 1);
                const end = view.coordsAtPos(to, -1);
                // x moving backwards means a new line (a wrap or a hard break).
                if (line && start.left < line.right - 2) {
                    flush();
                }
                line = line
                    ? { ...line, to, right: Math.max(line.right, end.right) }
                    : { from, to, left: start.left, right: end.right };
            };

            paragraph.forEach((node, offset) => {
                const pos = paragraphOffset + 1 + offset;
                if (node.isText) {
                    let at = pos;
                    for (const char of node.text ?? '') {
                        addGlyph(at, at + char.length);
                        at += char.length;
                    }
                } else if (node.type.name === 'sprite') {
                    addGlyph(pos, pos + node.nodeSize);
                } else {
                    flush();
                }
            });
            flush();
        });
    } catch {
        return [];
    }
    return shifts;
};
