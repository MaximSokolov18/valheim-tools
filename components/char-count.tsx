import { cn } from '../lib/utils';

/** "count/limit" in tabular figures; turns destructive once the limit is passed. */
export function CharCount({ count, limit, className }: { count: number; limit: number; className?: string }) {
    return (
        <span className={cn('tabular-nums', count > limit ? 'text-destructive' : 'text-muted-foreground', className)}>
            {count}/{limit}
        </span>
    );
}
