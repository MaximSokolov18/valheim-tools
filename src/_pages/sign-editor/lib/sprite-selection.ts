import { NodeSelection, Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

/**
 * The document position for a pointer over the editor. A sprite is an atomic
 * placeholder, so the browser can't resolve a caret position *inside* it and
 * every point over it collapses to the end of the sprite run. Resolve it
 * ourselves instead: the left half of a sprite means "before it", the right
 * half "after it". Anywhere else falls back to `posAtCoords`.
 */
const resolvePointerPos = (view: EditorView, x: number, y: number): { pos: number; sprite: number | null } | null => {
    let hit: { pos: number; sprite: number } | null = null;
    view.state.doc.descendants((node, pos) => {
        if (hit) return false;
        if (node.type.name !== 'sprite') return true;
        const dom = view.nodeDOM(pos);
        if (!(dom instanceof HTMLElement)) return false;
        const rect = dom.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            hit = { pos: x < (rect.left + rect.right) / 2 ? pos : pos + node.nodeSize, sprite: pos };
        }
        return false;
    });
    if (hit) return hit;
    const resolved = view.posAtCoords({ left: x, top: y });
    return resolved ? { pos: resolved.pos, sprite: null } : null;
};

/**
 * Lets a mouse press that lands on a sprite start (and extend) a text selection,
 * which the browser can't do natively from inside an atomic node. A plain click
 * still selects the sprite itself.
 */
export const spriteSelection = new Plugin({
    key: new PluginKey('spriteSelection'),
    props: {
        handleDOMEvents: {
            mousedown: (view, event) => {
                if (event.button !== 0 || event.detail > 1 || !view.editable) return false;
                const start = resolvePointerPos(view, event.clientX, event.clientY);
                if (start?.sprite == null) return false;

                event.preventDefault();
                view.focus();
                const { doc } = view.state;
                const anchor = event.shiftKey ? view.state.selection.anchor : start.pos;
                let moved = false;

                const select = (head: number) =>
                    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, anchor, head)));
                if (event.shiftKey) select(start.pos);
                else select(anchor);

                const handleMove = (move: MouseEvent) => {
                    const target = resolvePointerPos(view, move.clientX, move.clientY);
                    if (!target || view.isDestroyed) return;
                    moved = moved || target.pos !== anchor;
                    select(target.pos);
                };
                const stop = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', stop);
                    if (!moved && !event.shiftKey && !view.isDestroyed && view.state.doc === doc) {
                        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, start.sprite!)));
                    }
                };
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', stop);
                return true;
            },
        },
    },
});
