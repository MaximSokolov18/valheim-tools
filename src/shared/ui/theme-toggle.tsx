'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '../lib';
import { Toggle } from '../../../components/ui/toggle';
import { THEME_STORAGE_KEY, THEME_TRANSITION_MS } from '../config/theme';

const subscribe = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
};
const getIsDark = () => document.documentElement.classList.contains('dark');
const getServerIsDark = () => true;

let transitionTimer: number | undefined;

/**
 * Sun/moon theme switch. Birch (light) shows the sun, Peat (dark) the moon;
 * on click one sets with a quarter turn while the other rises, and the page
 * crossfades its colors (html.theme-transition). The icons follow the `dark`
 * class through CSS, so they are right on first paint.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const isDark = useSyncExternalStore(subscribe, getIsDark, getServerIsDark);

    const setDark = (next: boolean) => {
        const root = document.documentElement;
        root.classList.add('theme-transition');
        window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(() => root.classList.remove('theme-transition'), THEME_TRANSITION_MS);
        root.classList.toggle('dark', next);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
        } catch {
            // Private mode or blocked storage: the switch still works for this page view.
        }
    };

    const icon = 'absolute inset-0 m-auto size-5 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none';

    return (
        // Kit toggle: a fixed name with a pressed state is how screen readers expect a switch like this.
        <Toggle
            aria-label="Dark theme"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            pressed={isDark}
            onPressedChange={setDark}
            className={cn(
                'relative size-9 overflow-hidden rounded-full p-0 text-foreground sm:size-10',
                'hover:bg-control aria-pressed:bg-transparent aria-pressed:hover:bg-control',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                className,
            )}
        >
            {/* Sun: up in Birch, sets (turns and sinks) into Peat. */}
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className={cn(icon, 'rotate-0 opacity-100 dark:translate-y-3 dark:rotate-90 dark:opacity-0')}
            >
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
            </svg>
            {/* Moon: rises in Peat, sets into Birch. */}
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(icon, 'translate-y-3 -rotate-90 opacity-0 dark:translate-y-0 dark:rotate-0 dark:opacity-100')}
            >
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
        </Toggle>
    );
}
