'use client';

import { useState, type ComponentProps } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

/** How long the button shows "Copied" before reverting. */
const COPIED_RESET_MS = 1500;

type CopyButtonProps = {
    /** The text written to the clipboard. */
    value: string;
    /** Accessible name when "Copy" alone is ambiguous, e.g. several copy buttons on one page. */
    label?: string;
} & Pick<ComponentProps<typeof Button>, 'variant' | 'disabled' | 'className'>;

/**
 * Kit button that copies `value` and confirms with "Copied". Its width fits the
 * longer label, so swapping labels never reflows the content beside it. Nothing
 * changes when the clipboard write fails.
 */
export function CopyButton({ value, label, variant = 'default', disabled, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            return;
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    };

    return (
        <Button
            type="button"
            variant={variant}
            onClick={copy}
            disabled={disabled}
            aria-label={label}
            className={cn('w-[5.5rem] rounded-lg font-semibold', className)}
        >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
        </Button>
    );
}
