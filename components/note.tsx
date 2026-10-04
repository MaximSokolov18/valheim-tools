import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

const VARIANTS = {
    tip: { label: 'Tip', tone: 'text-brand-text', rule: 'border-foreground' },
    cost: { label: 'Cost', tone: 'text-moss', rule: 'border-moss' },
    save: { label: 'Save', tone: 'text-moss', rule: 'border-moss' },
    watch: { label: 'Watch', tone: 'text-warning', rule: 'border-warning' },
} as const;

/**
 * A short note from the design system: a 2px rule, a small capitalised label
 * and one or two sentences. It sits inline in the text column, after the
 * paragraph it comments on.
 */
export function Note({
    variant = 'tip',
    className,
    children,
}: {
    variant?: keyof typeof VARIANTS;
    className?: string;
    children: ReactNode;
}) {
    const v = VARIANTS[variant];
    return (
        <div
            role="note"
            className={cn(
                'font-body my-6 border-t-2 pt-3 text-[0.75rem] leading-relaxed',
                v.rule,
                className,
            )}
        >
            <p className={cn('mb-1.5 flex items-center gap-1.5 text-[0.6rem] font-semibold tracking-[0.08em] uppercase', v.tone)}>
                <span aria-hidden="true" className="size-2 rounded-[2px] bg-current" />
                {v.label}
            </p>
            <div className="text-foreground [&_strong]:font-semibold">{children}</div>
        </div>
    );
}
