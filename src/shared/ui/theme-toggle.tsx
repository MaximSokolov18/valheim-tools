'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib';
import { useTheme } from '../model';

interface Props {
    className?: string;
}

export const ThemeToggle = ({ className }: Props) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            onClick={toggleTheme}
            className={cn(
                'flex justify-center items-center aspect-square min-w-7 h-7 rounded-[calc(var(--radius-md)-2px)]',
                'bg-control text-control-foreground outline-hidden select-none transition-colors hover:bg-control-hover',
                className,
            )}
        >
            {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
        </button>
    );
};
