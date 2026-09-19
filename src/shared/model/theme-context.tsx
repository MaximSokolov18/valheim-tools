'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'dark';

/**
 * Runs before hydration (see `app/layout.tsx`'s `beforeInteractive` Script) so the
 * `dark` class is already correct on `<html>` by the time the page paints, instead
 * of flashing the default theme first.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var theme=(t==='light'||t==='dark')?t:'${DEFAULT_THEME}';document.documentElement.classList.toggle('dark',theme==='dark');}catch(e){}})();`;

const listeners = new Set<() => void>();

/** Live theme, read straight from `<html>` — the class the init script (and `applyTheme`) set. */
const getSnapshot = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

/** Matches what the server renders, so hydration never mismatches; `useSyncExternalStore`
 *  swaps to the real client value (from `getSnapshot`) right after. */
const getServerSnapshot = (): Theme => DEFAULT_THEME;

const subscribe = (onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
};

const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
        window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Storage may be unavailable (private mode, disabled storage); the
        // theme still applies for the current session.
    }
    listeners.forEach((listener) => listener());
};

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark');

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
