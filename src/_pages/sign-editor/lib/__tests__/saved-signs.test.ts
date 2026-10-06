import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import {
    addSavedSign,
    defaultSignName,
    isEmptySignDoc,
    normalizeSignName,
    parseDraft,
    parseSavedSigns,
    removeSavedSign,
    restoreSavedSign,
    serializeDraft,
    serializeSavedSigns,
    updateSavedSign,
    SIGN_NAME_MAX_LENGTH,
    UNTITLED_SIGN_NAME,
    type SavedSign,
} from '../saved-signs';

const doc = (...lines: string[]): JSONContent => ({
    type: 'doc',
    content: lines.map((text) => (text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' })),
});
const sign = (id: string, name = id): SavedSign => ({ id, name, doc: doc(name), markup: name, updatedAt: 1 });

describe('isEmptySignDoc', () => {
    it('is true for empty paragraphs and false once anything is on the board', () => {
        expect(isEmptySignDoc({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true);
        expect(isEmptySignDoc(doc('', 'MEAT'))).toBe(false);
        expect(isEmptySignDoc({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'sprite', attrs: { index: 3 } }] }] })).toBe(false);
    });
});

describe('defaultSignName', () => {
    it('uses the first line with text, whitespace collapsed', () => {
        expect(defaultSignName(doc('', '  🥩   MEAT ', 'raw'))).toBe('🥩 MEAT');
    });

    it('adds the first line with words when the first line is only an icon', () => {
        expect(defaultSignName(doc('⛏', 'copper + tin'))).toBe('⛏ copper + tin');
        expect(defaultSignName(doc('⛏'))).toBe('⛏');
    });

    it('cuts long lines with an ellipsis and falls back for signs without text', () => {
        expect(defaultSignName(doc('A very long first line that keeps going on'))).toMatch(/…$/);
        expect([...defaultSignName(doc('x'.repeat(80)))].length).toBeLessThanOrEqual(28);
        expect(defaultSignName(doc(''))).toBe(UNTITLED_SIGN_NAME);
    });
});

describe('normalizeSignName', () => {
    it('trims, collapses spaces, caps the length and falls back when blank', () => {
        expect(normalizeSignName('  Ore   chest ', 'x')).toBe('Ore chest');
        expect([...normalizeSignName('y'.repeat(99), 'x')]).toHaveLength(SIGN_NAME_MAX_LENGTH);
        expect(normalizeSignName('   ', 'Fallback')).toBe('Fallback');
    });
});

describe('stored signs', () => {
    it('round-trips through serialize and parse', () => {
        const signs = [sign('a'), sign('b')];
        expect(parseSavedSigns(serializeSavedSigns(signs))).toEqual(signs);
    });

    it('drops malformed and duplicate entries but keeps the valid ones', () => {
        const raw = JSON.stringify({
            version: 1,
            signs: [sign('a'), { id: 'no-doc', markup: '' }, 'junk', sign('a'), { ...sign('b'), name: '' }],
        });
        const parsed = parseSavedSigns(raw);
        expect(parsed.map((s) => s.id)).toEqual(['a', 'b']);
        expect(parsed[1].name).toBe('b'); // a missing name is rebuilt from the sign's text
    });

    it('treats unreadable storage as no signs', () => {
        expect(parseSavedSigns(null)).toEqual([]);
        expect(parseSavedSigns('{not json')).toEqual([]);
        expect(parseSavedSigns('[]')).toEqual([]);
    });
});

describe('draft', () => {
    it('round-trips and rejects anything that is not a document', () => {
        expect(parseDraft(serializeDraft(doc('MEAT')))).toEqual(doc('MEAT'));
        expect(parseDraft(JSON.stringify({ doc: { type: 'paragraph' } }))).toBeNull();
        expect(parseDraft('oops')).toBeNull();
    });
});

describe('list operations', () => {
    it('adds newest first, updates in place and removes by id', () => {
        let list = addSavedSign([sign('a')], sign('b'));
        expect(list.map((s) => s.id)).toEqual(['b', 'a']);
        list = updateSavedSign(list, 'a', { name: 'Ore' }, 42);
        expect(list[1]).toMatchObject({ id: 'a', name: 'Ore', updatedAt: 42 });
        expect(removeSavedSign(list, 'b').map((s) => s.id)).toEqual(['a']);
    });

    it('restores a removed sign at its old position', () => {
        const list = [sign('a'), sign('b'), sign('c')];
        const restored = restoreSavedSign(removeSavedSign(list, 'b'), list[1], 1);
        expect(restored.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    });
});
