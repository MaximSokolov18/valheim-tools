'use client';

import { useSyncExternalStore } from 'react';
import type { JSONContent } from '@tiptap/core';
import {
    addSavedSign,
    createSignId,
    isEmptySignDoc,
    parseDraft,
    parseSavedSigns,
    removeSavedSign,
    restoreSavedSign,
    serializeDraft,
    serializeSavedSigns,
    updateSavedSign,
    type SavedSign,
} from '../lib/saved-signs';

/*
 * Saved signs, the board draft and the open sign live in this browser's local
 * storage only: nothing is sent anywhere. Every access is guarded, because
 * storage can be blocked (private mode, site data off) or full; the editor then
 * keeps working for the page view and simply does not remember.
 */
export const SAVED_SIGNS_KEY = 'vt-sign-editor:saved-signs';
export const DRAFT_KEY = 'vt-sign-editor:draft';
export const ACTIVE_SIGN_KEY = 'vt-sign-editor:active-sign';

const readItem = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

/** Returns false when the browser refused the write (blocked or full). */
const writeItem = (key: string, value: string | null): boolean => {
    try {
        if (value == null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
};

interface LibraryState {
    signs: readonly SavedSign[];
    activeId: string | null;
}

const EMPTY_STATE: LibraryState = { signs: [], activeId: null };

let state: LibraryState | null = null;
const listeners = new Set<() => void>();

const load = (): LibraryState => {
    const signs = parseSavedSigns(readItem(SAVED_SIGNS_KEY));
    const activeId = readItem(ACTIVE_SIGN_KEY);
    return { signs, activeId: activeId && signs.some((sign) => sign.id === activeId) ? activeId : null };
};

const getState = (): LibraryState => (state ??= load());

const emit = () => listeners.forEach((listener) => listener());

const setState = (next: LibraryState): boolean => {
    const previous = getState();
    let ok = true;
    if (next.signs !== previous.signs) ok = writeItem(SAVED_SIGNS_KEY, serializeSavedSigns(next.signs));
    if (ok && next.activeId !== previous.activeId) writeItem(ACTIVE_SIGN_KEY, next.activeId);
    if (!ok) return false;
    state = next;
    emit();
    return true;
};

/** Another tab saved or deleted a sign: pick it up. */
const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SAVED_SIGNS_KEY || event.key === ACTIVE_SIGN_KEY) {
        state = load();
        emit();
    }
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener('storage', onStorage);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
};

export const savedSignsStore = {
    getState,

    /** Saves a new sign and makes it the open one. Returns it, or null if the browser refused. */
    create(doc: JSONContent, markup: string, name: string): SavedSign | null {
        const sign: SavedSign = { id: createSignId(), name, doc, markup, updatedAt: Date.now() };
        const current = getState();
        return setState({ signs: addSavedSign(current.signs, sign), activeId: sign.id }) ? sign : null;
    },

    /** Overwrites a saved sign's content with the board's. */
    update(id: string, doc: JSONContent, markup: string): boolean {
        const current = getState();
        return setState({ ...current, signs: updateSavedSign(current.signs, id, { doc, markup }, Date.now()) });
    },

    rename(id: string, name: string): boolean {
        const current = getState();
        return setState({ ...current, signs: updateSavedSign(current.signs, id, { name }, Date.now()) });
    },

    /** Deletes a sign; returns what "Undo" needs to put it back. */
    remove(id: string): { sign: SavedSign; index: number; wasActive: boolean } | null {
        const current = getState();
        const index = current.signs.findIndex((sign) => sign.id === id);
        if (index < 0) return null;
        const wasActive = current.activeId === id;
        const ok = setState({
            signs: removeSavedSign(current.signs, id),
            activeId: wasActive ? null : current.activeId,
        });
        return ok ? { sign: current.signs[index], index, wasActive } : null;
    },

    restore(sign: SavedSign, index: number, makeActive: boolean): boolean {
        const current = getState();
        return setState({
            signs: restoreSavedSign(current.signs, sign, index),
            activeId: makeActive ? sign.id : current.activeId,
        });
    },

    /** Marks which saved sign the board is editing (null: a new, unsaved sign). */
    setActive(id: string | null): void {
        setState({ ...getState(), activeId: id });
    },

    /** Test hook: forget the in-memory copy so the next read comes from storage. */
    reset(): void {
        state = null;
    },
};

/** All saved signs and the open one, kept in sync with storage and other tabs. */
export const useSavedSigns = (): LibraryState =>
    useSyncExternalStore(subscribe, getState, () => EMPTY_STATE);

/* The board draft: what was on the board last time. */

export const loadDraft = (): JSONContent | null => parseDraft(readItem(DRAFT_KEY));

export const saveDraft = (doc: JSONContent): void => {
    writeItem(DRAFT_KEY, isEmptySignDoc(doc) ? null : serializeDraft(doc));
};
