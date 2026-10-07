import { Extension } from '@tiptap/core';
import { Plugin, type Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';

/** `true` when every step only removes text, and all of it is whitespace. */
const deletesOnlyWhitespace = (tr: Transaction): boolean =>
    tr.steps.length > 0 &&
    tr.steps.every(
        (step, index) =>
            step instanceof ReplaceStep &&
            step.slice.size === 0 &&
            tr.docs[index].textBetween(step.from, step.to, ' ', ' ').trim() === '',
    );

/**
 * Inserts typed characters through a transaction instead of letting the browser edit the DOM.
 * Typing where two colored runs meet (`hello` + `world` after deleting the space between them)
 * makes Chrome put the character into its own span; ProseMirror then re-reads that stretch of DOM
 * and loses the runs' colors (or brings them back as `rgb(...)`, which the sign markup drops).
 * A transaction gives the new text the marks before the caret, so it continues the previous color.
 * IME composition is left to the browser.
 *
 * ProseMirror also keeps a deleted run's marks for the next typed character. A deleted space shows
 * no color, so those kept marks are dropped and typing follows the character before the caret.
 */
export const TypedTextInput = Extension.create({
    name: 'typedTextInput',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                appendTransaction: (transactions, _oldState, newState) => {
                    const last = transactions[transactions.length - 1];
                    if (newState.storedMarks && last.storedMarksSet && deletesOnlyWhitespace(last)) {
                        return newState.tr.setStoredMarks(null);
                    }
                    return null;
                },
                props: {
                    handleDOMEvents: {
                        beforeinput: (view, event) => {
                            if (event.inputType !== 'insertText' || event.isComposing || !event.data) {
                                return false;
                            }
                            event.preventDefault();
                            const text = event.data;
                            const { from, to } = view.state.selection;
                            const insert = () => view.state.tr.insertText(text, from, to);
                            // input rules and other `handleTextInput` handlers still get the first say
                            if (!view.someProp('handleTextInput', (handle) => handle(view, from, to, text, insert))) {
                                view.dispatch(insert().scrollIntoView());
                            }
                            return true;
                        },
                    },
                },
            }),
        ];
    },
});
