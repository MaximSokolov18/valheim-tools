import { cn } from '../../../lib/utils';

export type SpotName = 'hammer' | 'chest' | 'portal' | 'signpost';

/** Small painted spot drawing (public/images/spots). Decorative, so it has no alt text. */
export function Spot({ name, className }: { name: SpotName; className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`/images/spots/${name}.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={cn(
                'pointer-events-none h-auto shrink-0 select-none mix-blend-multiply dark:opacity-90 dark:mix-blend-normal',
                className,
            )}
        />
    );
}
