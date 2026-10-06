'use client';

import { useCallback, useEffect } from 'react';
import { useEditorState } from '@tiptap/react';
import { closeHistory } from '@tiptap/pm/history';
import { BookmarkPlus, FilePlus2, Save } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { toastManager } from '../../../../components/ui/toast';
import { Spot } from '../../../shared/ui/spot';
import { translateSignText } from '../lib';
import { SAVED_SIGNS_LIMIT, defaultSignName, isEmptySignDoc, type SavedSign } from '../lib/saved-signs';
import { savedSignsStore, useSavedSigns, useSignEditor } from '../model';
import { SavedSignCard } from './saved-sign-card';

const STORAGE_REFUSED = {
    type: 'error',
    title: 'Could not save',
    description: 'Your browser blocked storage for this site, or it is full.',
} as const;

const undo = (onClick: () => void) => ({ actionProps: { children: 'Undo', onClick } });

/** The panel's toasts share one id: each replaces the last, so only the latest action can be undone. */
const PANEL_TOAST_ID = 'saved-signs';
type ToastOptions = Parameters<typeof toastManager.add>[0];
const notify = (options: ToastOptions) => {
    toastManager.close(PANEL_TOAST_ID);
    toastManager.add({ ...options, id: PANEL_TOAST_ID });
};

/**
 * Saved signs beside the board: save the board as a favourite, open one to use
 * or edit it, save changes back, rename, copy and delete. Everything stays in
 * this browser (see model/saved-signs-store.ts).
 */
export function SavedSignsPanel({ className }: { className?: string }) {
    const editor = useSignEditor();
    const { signs, activeId } = useSavedSigns();
    const board = useEditorState({
        editor,
        selector: ({ editor }) =>
            editor ? { markup: translateSignText(editor), empty: isEmptySignDoc(editor.getJSON()) } : null,
    });

    const active = signs.find((sign) => sign.id === activeId) ?? null;
    const empty = board?.empty ?? true;
    const unsaved = active != null && board != null && board.markup !== active.markup;
    const full = signs.length >= SAVED_SIGNS_LIMIT;

    const saveNew = useCallback(() => {
        if (!editor || full) return;
        const doc = editor.getJSON();
        if (isEmptySignDoc(doc)) return;
        const created = savedSignsStore.create(doc, translateSignText(editor), defaultSignName(doc));
        if (!created) return notify(STORAGE_REFUSED);
        notify({ title: `Saved “${created.name}”` });
    }, [editor, full]);

    const saveChanges = useCallback(() => {
        if (!editor || !active) return;
        if (!savedSignsStore.update(active.id, editor.getJSON(), translateSignText(editor))) {
            return notify(STORAGE_REFUSED);
        }
        notify({ title: `Saved changes to “${active.name}”` });
    }, [editor, active]);

    /** Replaces the board, keeping the old one a click ("Undo") away. */
    const replaceBoard = (apply: () => void, title: string) => {
        if (!editor) return;
        const previousActive = savedSignsStore.getState().activeId;
        const hadContent = !isEmptySignDoc(editor.getJSON());
        // Its own undo step: not merged with typing just before or after it.
        const closeUndoGroup = () => editor.view.dispatch(closeHistory(editor.state.tr));
        closeUndoGroup();
        apply();
        closeUndoGroup();
        notify({
            title,
            ...(hadContent
                ? undo(() => {
                      editor.commands.undo();
                      savedSignsStore.setActive(previousActive);
                  })
                : {}),
        });
    };

    const open = (sign: SavedSign) => {
        if (!editor) return;
        if (sign.id === activeId && !unsaved) return;
        replaceBoard(() => {
            editor.commands.setContent(sign.doc, { emitUpdate: true });
            savedSignsStore.setActive(sign.id);
        }, `Opened “${sign.name}”`);
    };

    const startNew = () => {
        if (!editor) return;
        replaceBoard(() => {
            editor.commands.clearContent(true);
            savedSignsStore.setActive(null);
        }, 'Started a new sign');
    };

    const rename = (sign: SavedSign, name: string) => {
        if (!savedSignsStore.rename(sign.id, name)) notify(STORAGE_REFUSED);
    };

    const remove = (sign: SavedSign) => {
        const removed = savedSignsStore.remove(sign.id);
        if (!removed) return;
        notify({
            title: `Deleted “${sign.name}”`,
            ...undo(() => savedSignsStore.restore(removed.sign, removed.index, removed.wasActive)),
        });
    };

    // Ctrl/Cmd+S saves the board: back to the open sign, or as a new one.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's' || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (unsaved) saveChanges();
            else if (!active) saveNew();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [unsaved, active, saveChanges, saveNew]);

    const status = active
        ? unsaved
            ? { text: 'Unsaved changes to', tone: 'text-warning' }
            : { text: 'Saved as', tone: 'text-moss' }
        : { text: empty ? 'The board is empty' : 'New sign, not saved yet', tone: 'text-muted-foreground' };

    return (
        <aside
            aria-labelledby="saved-signs-title"
            className={cn(
                'font-body flex w-full flex-col rounded-xl border border-border bg-card/90 shadow-[var(--shadow-panel)] backdrop-blur-md',
                className,
            )}
        >
            <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <h2 id="saved-signs-title" className="font-heading text-[1.05rem] font-medium">
                    Saved signs
                </h2>
                <span className="text-[0.65rem] text-muted-foreground tabular-nums" title={`Up to ${SAVED_SIGNS_LIMIT}`}>
                    {signs.length}
                </span>
            </header>

            <section aria-label="Current board" className="flex flex-col gap-2 border-b border-border px-3 py-3">
                <p role="status" className="min-h-[1.25em] truncate text-[0.7rem]">
                    <span className={status.tone}>{status.text}</span>
                    {active && <span className="font-semibold text-foreground"> {active.name}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {active ? (
                        <>
                            <Button type="button" size="sm" onClick={saveChanges} disabled={!unsaved} className="h-7 rounded-lg px-2.5 font-semibold">
                                <Save aria-hidden />
                                Save changes
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={saveNew}
                                disabled={empty || full}
                                className="h-7 rounded-lg px-2.5"
                            >
                                <BookmarkPlus aria-hidden />
                                Save as new
                            </Button>
                        </>
                    ) : (
                        <Button type="button" size="sm" onClick={saveNew} disabled={empty || full} className="h-7 rounded-lg px-2.5 font-semibold">
                            <BookmarkPlus aria-hidden />
                            Save sign
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={startNew}
                        disabled={empty && !active}
                        className="h-7 rounded-lg px-2.5"
                    >
                        <FilePlus2 aria-hidden />
                        New sign
                    </Button>
                </div>
                {full && (
                    <p className="text-[0.65rem] text-warning">
                        You have {SAVED_SIGNS_LIMIT} saved signs. Delete one to save another.
                    </p>
                )}
            </section>

            {signs.length ? (
                <ul aria-label="Saved signs" className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
                    {signs.map((sign) => (
                        <SavedSignCard
                            key={sign.id}
                            sign={sign}
                            active={sign.id === activeId}
                            unsaved={sign.id === activeId && unsaved}
                            onOpen={open}
                            onRename={rename}
                            onDelete={remove}
                        />
                    ))}
                </ul>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                    <Spot name="chest" className="w-20 opacity-90" />
                    <p className="font-heading text-[0.95rem] font-medium">No saved signs yet</p>
                    <p className="max-w-[15rem] text-[0.7rem] leading-relaxed text-muted-foreground">
                        Save signs you use often, like chest labels, to open, edit and copy them again later.
                    </p>
                </div>
            )}

            <p className="border-t border-border px-3 py-2 text-[0.6rem] leading-relaxed text-muted-foreground">
                Saved in this browser only. Your board is kept too, so it is here next time.
            </p>
        </aside>
    );
}
