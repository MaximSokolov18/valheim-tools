import { cn } from '../../../../lib/utils';

/** Splits markup into tags/escapes and plain text, so tags can be tinted. */
const TOKEN = /(<[^>]*>|\\[nvrt])/;

/** Sign markup as typed, with tags in the brand color and plain text in ink. */
export function SignMarkup({ markup, className }: { markup: string; className?: string }) {
    return (
        <code className={cn('font-mono whitespace-pre-wrap [overflow-wrap:anywhere]', className)}>
            {markup.split(TOKEN).map((part, i) =>
                i % 2 ? (
                    // <wbr> lets long markup wrap between tags rather than mid-word.
                    <span key={i} className="text-brand-text">
                        {part}
                        <wbr />
                    </span>
                ) : (
                    <span key={i} className="text-foreground">
                        {part}
                    </span>
                ),
            )}
        </code>
    );
}
