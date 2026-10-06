import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import {
    ACTIVE_SIGN_KEY,
    DRAFT_KEY,
    SAVED_SIGNS_KEY,
    loadDraft,
    saveDraft,
    savedSignsStore,
} from '../saved-signs-store';

const doc = (text: string): JSONContent => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

beforeEach(() => {
    localStorage.clear();
    savedSignsStore.reset();
});
afterEach(() => vi.restoreAllMocks());

describe('savedSignsStore', () => {
    it('saves a sign to storage and makes it the open one', () => {
        const sign = savedSignsStore.create(doc('MEAT'), 'MEAT', 'Meat chest');
        expect(sign).not.toBeNull();
        expect(savedSignsStore.getState()).toMatchObject({ activeId: sign?.id, signs: [{ name: 'Meat chest', markup: 'MEAT' }] });
        expect(localStorage.getItem(ACTIVE_SIGN_KEY)).toBe(sign?.id);

        savedSignsStore.reset(); // a later visit reads it back from storage
        expect(savedSignsStore.getState().signs).toHaveLength(1);
        expect(savedSignsStore.getState().activeId).toBe(sign?.id);
    });

    it('updates, renames, deletes and restores', () => {
        const a = savedSignsStore.create(doc('A'), 'A', 'A')!;
        const b = savedSignsStore.create(doc('B'), 'B', 'B')!;
        savedSignsStore.update(a.id, doc('A2'), 'A2');
        savedSignsStore.rename(a.id, 'Ore chest');
        expect(savedSignsStore.getState().signs.find((s) => s.id === a.id)).toMatchObject({ markup: 'A2', name: 'Ore chest' });

        const removed = savedSignsStore.remove(b.id)!;
        expect(removed).toMatchObject({ index: 0, wasActive: true });
        expect(savedSignsStore.getState()).toMatchObject({ activeId: null });
        savedSignsStore.restore(removed.sign, removed.index, removed.wasActive);
        expect(savedSignsStore.getState().signs.map((s) => s.id)).toEqual([b.id, a.id]);
        expect(savedSignsStore.getState().activeId).toBe(b.id);
    });

    it('ignores an open sign that no longer exists', () => {
        localStorage.setItem(ACTIVE_SIGN_KEY, 'gone');
        expect(savedSignsStore.getState().activeId).toBeNull();
    });

    it('reports a refused write and keeps the previous list', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError');
        });
        expect(savedSignsStore.create(doc('X'), 'X', 'X')).toBeNull();
        expect(savedSignsStore.getState().signs).toEqual([]);
        expect(localStorage.getItem(SAVED_SIGNS_KEY)).toBeNull();
    });
});

describe('draft', () => {
    it('stores the board and clears it once the board is empty', () => {
        saveDraft(doc('MEAT'));
        expect(loadDraft()).toEqual(doc('MEAT'));
        saveDraft({ type: 'doc', content: [{ type: 'paragraph' }] });
        expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
        expect(loadDraft()).toBeNull();
    });
});
