import type { JSONContent } from '@tiptap/core';

/** Most signs a player can keep; the panel stops offering "Save" at this count. */
export const SAVED_SIGNS_LIMIT = 60;

/** Longest sign name, in characters. */
export const SIGN_NAME_MAX_LENGTH = 40;

/** Name used when a sign has no text to name it after. */
export const UNTITLED_SIGN_NAME = 'Untitled sign';

/** Length of a generated name before it is cut with an ellipsis. */
const DEFAULT_NAME_LENGTH = 28;

/** Version of the stored formats; bump it if their shape changes. */
export const STORAGE_VERSION = 1;

export interface SavedSign {
    id: string;
    name: string;
    /** The editor document, so the sign reopens with every format intact. */
    doc: JSONContent;
    /** Its markup when saved; used to copy it and to tell whether the board differs. */
    markup: string;
    /** Milliseconds since the epoch. */
    updatedAt: number;
}

/** Text of each paragraph (sprites and line breaks drop out). */
const paragraphTexts = (doc: JSONContent): string[] =>
    (doc.content ?? []).map((paragraph) =>
        (paragraph.content ?? [])
            .map((node) => (node.type === 'text' ? (node.text ?? '') : ''))
            .join(''),
    );

/** True when the document has no content at all (sprites count as content). */
export const isEmptySignDoc = (doc: JSONContent): boolean =>
    !(doc.content ?? []).some((paragraph) => (paragraph.content?.length ?? 0) > 0);

/** A name taken from the sign's first line of text, e.g. "🥩 MEAT". */
export const defaultSignName = (doc: JSONContent): string => {
    const lines = paragraphTexts(doc)
        .map((text) => text.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    if (!lines.length) return UNTITLED_SIGN_NAME;
    // A first line of only emoji (a big icon above the label) reads better with the label after it.
    const hasWords = (text: string) => /[\p{L}\p{N}]/u.test(text);
    const label = hasWords(lines[0]) ? undefined : lines.find(hasWords);
    const line = label ? `${lines[0]} ${label}` : lines[0];
    const chars = [...line];
    return chars.length > DEFAULT_NAME_LENGTH ? `${chars.slice(0, DEFAULT_NAME_LENGTH - 1).join('').trimEnd()}…` : line;
};

/** Trims and caps a name typed by the player, falling back when it is blank. */
export const normalizeSignName = (name: string, fallback: string): string => {
    const trimmed = [...name.replace(/\s+/g, ' ').trim()].slice(0, SIGN_NAME_MAX_LENGTH).join('');
    return trimmed || fallback;
};

export const createSignId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sign-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isSignDoc = (value: unknown): value is JSONContent =>
    isRecord(value) && value.type === 'doc' && (value.content === undefined || Array.isArray(value.content));

const toSavedSign = (value: unknown): SavedSign | null => {
    if (!isRecord(value)) return null;
    const { id, name, doc, markup, updatedAt } = value;
    if (typeof id !== 'string' || !id || typeof markup !== 'string' || !isSignDoc(doc)) return null;
    return {
        id,
        name: typeof name === 'string' && name.trim() ? name : defaultSignName(doc),
        doc,
        markup,
        updatedAt: typeof updatedAt === 'number' && Number.isFinite(updatedAt) ? updatedAt : 0,
    };
};

/** Reads stored signs, keeping every valid entry and dropping anything malformed. */
export const parseSavedSigns = (raw: string | null): SavedSign[] => {
    if (!raw) return [];
    try {
        const data: unknown = JSON.parse(raw);
        if (!isRecord(data) || !Array.isArray(data.signs)) return [];
        const seen = new Set<string>();
        return data.signs.flatMap((entry) => {
            const sign = toSavedSign(entry);
            if (!sign || seen.has(sign.id)) return [];
            seen.add(sign.id);
            return [sign];
        });
    } catch {
        return [];
    }
};

export const serializeSavedSigns = (signs: readonly SavedSign[]): string =>
    JSON.stringify({ version: STORAGE_VERSION, signs });

/** Reads the stored board draft; null when there is none or it is unreadable. */
export const parseDraft = (raw: string | null): JSONContent | null => {
    if (!raw) return null;
    try {
        const data: unknown = JSON.parse(raw);
        return isRecord(data) && isSignDoc(data.doc) ? data.doc : null;
    } catch {
        return null;
    }
};

export const serializeDraft = (doc: JSONContent): string => JSON.stringify({ version: STORAGE_VERSION, doc });

/* List operations: pure, newest first. */

export const addSavedSign = (signs: readonly SavedSign[], sign: SavedSign): SavedSign[] => [sign, ...signs];

export const updateSavedSign = (
    signs: readonly SavedSign[],
    id: string,
    patch: Partial<Pick<SavedSign, 'name' | 'doc' | 'markup'>>,
    now: number,
): SavedSign[] => signs.map((sign) => (sign.id === id ? { ...sign, ...patch, updatedAt: now } : sign));

export const removeSavedSign = (signs: readonly SavedSign[], id: string): SavedSign[] =>
    signs.filter((sign) => sign.id !== id);

/** Puts a removed sign back where it was (used by "Undo"). */
export const restoreSavedSign = (signs: readonly SavedSign[], sign: SavedSign, index: number): SavedSign[] => {
    const without = removeSavedSign(signs, sign.id);
    const at = Math.max(0, Math.min(index, without.length));
    return [...without.slice(0, at), sign, ...without.slice(at)];
};
