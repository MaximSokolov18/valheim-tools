import { describe, it, expect } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions, GAME_COLOR_FILTER_ID, GAME_COLOR_MATRIX_VALUES } from '../lib';
import { Board } from './board';
import { BORDER_ID, TEXT_AREA_ID } from './constants';

// jsdom has no layout, so ProseMirror's own mousedown handler (which calls
// `posAtCoords` -> `elementFromPoint`) needs a stub to avoid throwing.
if (!document.elementFromPoint) {
    document.elementFromPoint = () => null;
}

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    const { container } = render(
        <EditorContext.Provider value={{ editor }}>
            <Board />
        </EditorContext.Provider>,
    );
    const board = container.querySelector(`#${BORDER_ID}`) as HTMLElement;
    return { editor, board };
};

describe('Board', () => {
    it('preserves a drag-selection when the mouse is released outside the editor', () => {
        const { editor, board } = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        // A drag-selection starts with mousedown inside the editable text...
        fireEvent.mouseDown(editor.view.dom);
        // ...and ends (mouseup -> click) over the board's own element, outside
        // the editor's DOM box, e.g. the wood beyond the text.
        fireEvent.click(board);

        expect(editor.state.selection.from).toBe(1);
        expect(editor.state.selection.to).toBe(6);
    });

    it('places the caret on a genuine click on the board outside the editor', () => {
        const { editor, board } = renderWithEditor('<p>hello</p>');
        act(() => {
            editor.commands.setTextSelection({ from: 1, to: 6 });
        });

        fireEvent.mouseDown(board);
        fireEvent.click(board);

        expect(editor.state.selection.from).toBe(editor.state.selection.to);
    });

    it('turns a drag that starts and ends on the board outside the editor into a real selection', () => {
        const { editor, board } = renderWithEditor('<p>hello</p>');
        editor.view.dom.getBoundingClientRect = () =>
            ({ width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100, x: 0, y: 0 }) as DOMRect;

        // The wood/padding around the text has nothing under the pointer to
        // anchor a native selection to, so a drag that starts there (e.g.
        // just left of the first character) and ends there too (e.g. just
        // past the last one) must still select everything in between.
        fireEvent.mouseDown(board, { clientX: -10, clientY: 50 });
        fireEvent.mouseMove(document, { clientX: 200, clientY: 50 });
        fireEvent.mouseUp(document);

        expect(editor.state.selection.from).toBe(1);
        expect(editor.state.selection.to).toBe(editor.state.doc.content.size - 1);
    });

    it('stops extending the selection once the mouse button is released', () => {
        const { editor, board } = renderWithEditor('<p>hello</p>');
        editor.view.dom.getBoundingClientRect = () =>
            ({ width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100, x: 0, y: 0 }) as DOMRect;

        fireEvent.mouseDown(board, { clientX: -10, clientY: 50 });
        fireEvent.mouseUp(document);
        const selectionAtRelease = { from: editor.state.selection.from, to: editor.state.selection.to };

        // A stray mousemove after release (button no longer held) must not
        // keep moving the selection.
        fireEvent.mouseMove(document, { clientX: 200, clientY: 50 });

        expect(editor.state.selection.from).toBe(selectionAtRelease.from);
        expect(editor.state.selection.to).toBe(selectionAtRelease.to);
    });
});

describe('Board color mode', () => {
    it('applies the game-color filter to the text area', () => {
        const { board } = renderWithEditor('<p>hello</p>');
        const textArea = board.querySelector(`#${TEXT_AREA_ID}`) as HTMLElement;
        // The CSSOM re-serializes `url(#id)` with quotes around the fragment
        // reference once it's read back from `style.filter`.
        expect(textArea.style.filter).toBe(`url("#${GAME_COLOR_FILTER_ID}")`);
    });

    it('renders the feColorMatrix that GAME_COLOR_FILTER references, with the exact calibrated matrix', () => {
        const { board } = renderWithEditor('<p>hello</p>');
        const matrix = board.querySelector('feColorMatrix');
        expect(matrix?.getAttribute('type')).toBe('matrix');
        expect(matrix?.getAttribute('values')).toBe(GAME_COLOR_MATRIX_VALUES);
    });
});
