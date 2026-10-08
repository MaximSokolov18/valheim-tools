import { NO_CONSENT, type ConsentDecision } from './tcf';

export type ConsentState = ConsentDecision & {
    /** The consent message API is ready and consent law applies, so the visitor can reopen it. */
    canReopen: boolean;
};

const INITIAL: ConsentState = Object.freeze({ ...NO_CONSENT, canReopen: false });

let state: ConsentState = INITIAL;
const listeners = new Set<() => void>();

/** Tiny external store, read with `useSyncExternalStore` (see AdSlot and PrivacySettingsButton). */
export const consentStore = {
    get: (): ConsentState => state,
    /** The server render and first client render always see "nothing allowed". */
    getServerSnapshot: (): ConsentState => INITIAL,
    subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    set(patch: Partial<ConsentState>): void {
        const next = { ...state, ...patch };
        if (next.ads === state.ads && next.analytics === state.analytics && next.canReopen === state.canReopen) return;
        state = next;
        listeners.forEach((listener) => listener());
    },
    /** Tests only. */
    reset(): void {
        state = INITIAL;
        listeners.clear();
    },
};
