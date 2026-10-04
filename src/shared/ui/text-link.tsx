import type { ComponentProps } from 'react';
import Link from 'next/link';
import { cn } from '../../../lib/utils';

/** Inline link in running text: ink with a soft underline that darkens on hover. */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn(
                'underline decoration-foreground/35 underline-offset-4 transition-colors hover:decoration-foreground',
                'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                className,
            )}
            {...props}
        />
    );
}
