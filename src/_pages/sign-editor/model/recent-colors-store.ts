'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { addRecentColor, parseRecentColors } from '../lib/recent-colors';

/*
 * Custom colors the player applied recently, one list per tool (text color and
 * highlight), so a color tuned once can be reused in one click. Kept in this
 * browser's local storage only; every access is guarded, because storage can
 * be blocked or full, and the pickers then simply forget after a reload.
 */
export type RecentColorsKind = 'text' | 'highlight';

export const RECENT_COLORS_KEYS: Record<RecentColorsKind, string> = {
    text: 'vt-sign-editor:recent-text-colors',
    highlight: 'vt-sign-editor:recent-highlight-colors',
};

const EMPTY: readonly string[] = [];
const KINDS = Object.keys(RECENT_COLORS_KEYS) as RecentColorsKind[];

const cache = new Map<RecentColorsKind, readonly string[]>();
const listeners = new Set<() => void>();

const read = (kind: RecentColorsKind): readonly string[] => {
    try {
        return parseRecentColors(window.localStorage.getItem(RECENT_COLORS_KEYS[kind]));
    } catch {
        return EMPTY;
    }
};

const getColors = (kind: RecentColorsKind): readonly string[] => {
    let colors = cache.get(kind);
    if (colors === undefined) {
        colors = read(kind);
        cache.set(kind, colors);
    }
    return colors;
};

const emit = () => listeners.forEach((listener) => listener());

/** Another tab used a color: pick up its list. */
const onStorage = (event: StorageEvent) => {
    const changed = KINDS.filter((kind) => event.key === null || event.key === RECENT_COLORS_KEYS[kind]);
    if (changed.length === 0) return;
    changed.forEach((kind) => cache.set(kind, read(kind)));
    emit();
};

const subscribe = (listener: () => void) => {
    if (listeners.size === 0) window.addEventListener('storage', onStorage);
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
};

export const recentColorsStore = {
    getColors,
    /** Remembers `hex` as the tool's most recent custom color (presets are skipped). */
    remember(kind: RecentColorsKind, hex: string) {
        const previous = getColors(kind);
        const next = addRecentColor(previous, hex);
        if (next === previous) return;
        cache.set(kind, next);
        try {
            window.localStorage.setItem(RECENT_COLORS_KEYS[kind], JSON.stringify(next));
        } catch {
            // Blocked or full storage: still remembered for this page view.
        }
        emit();
    },
    /** Test hook: forget the in-memory copies so the next read goes to storage. */
    reset() {
        cache.clear();
    },
};

/** The recent custom colors of one tool, newest first. */
export const useRecentColors = (kind: RecentColorsKind): readonly string[] => {
    const getSnapshot = useCallback(() => getColors(kind), [kind]);
    return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
};
