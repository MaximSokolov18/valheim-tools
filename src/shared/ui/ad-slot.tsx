'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { cn } from '../../../lib/utils';
import { GOOGLE, type AdPlacement } from '../config/google';
import { consentStore } from '../lib/consent';

/** `banner`: responsive unit across the content column. `rail`: fixed 160×600 skyscraper beside a tool. */
export type AdFormat = 'banner' | 'rail';

type AdSlotProps = {
    placement: AdPlacement;
    format?: AdFormat;
    /** Render only while this media query matches (checked in JS, so AdSense never gets a hidden, zero-size slot). */
    media?: string;
    className?: string;
};

const RAIL = { width: 160, height: 600 } as const;

const FRAME: Record<AdFormat, string> = {
    banner: 'mx-auto w-full max-w-3xl',
    rail: 'w-[160px] shrink-0',
};

/**
 * One fixed AdSense unit. Renders nothing until the visitor has allowed ads and the placement has an ad unit ID,
 * and hides itself again when Google has no ad to fill it.
 */
export function AdSlot({ placement, format = 'banner', media, className }: AdSlotProps) {
    const { ads } = useSyncExternalStore(consentStore.subscribe, consentStore.get, consentStore.getServerSnapshot);
    const fits = useMediaQuery(media);
    if (!fits) return null;
    // `npm run dev` only: a stand-in box so placements can be reviewed without Google. Never in a build.
    if (process.env.NODE_ENV === 'development') return <AdPreview placement={placement} format={format} className={className} />;
    const slot = GOOGLE.adSlots[placement];
    if (!ads || !slot || !GOOGLE.publisherId) return null;
    return <AdUnit client={`ca-${GOOGLE.publisherId}`} slot={slot} format={format} className={className} />;
}

/** True when there is no query; false on the server and until the client has checked. */
function useMediaQuery(query: string | undefined): boolean {
    return useSyncExternalStore(
        (onChange) => {
            if (!query) return () => {};
            const list = window.matchMedia(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        () => (query ? window.matchMedia(query).matches : true),
        () => !query,
    );
}

function AdLabel() {
    return (
        <p className="mb-1.5 text-center text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Advertisement
        </p>
    );
}

/** Same frame as a real unit. Banners at the sizes responsive ads most often take: 728×90 wide, full width × 280 on phones. */
function AdPreview({ placement, format, className }: { placement: AdPlacement; format: AdFormat; className?: string }) {
    const box = 'flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input bg-muted/40 text-center text-[0.65rem] text-muted-foreground';
    return (
        <aside aria-label="Advertisement" className={cn('font-body', FRAME[format], className)}>
            <AdLabel />
            {format === 'rail' ? (
                <div className={cn(box, 'px-2')} style={RAIL}>
                    <span className="font-semibold">Ad preview: {placement}</span>
                    <span>160 × 600</span>
                </div>
            ) : (
                <div className={cn(box, 'mx-auto h-[280px] w-full max-w-[728px] sm:h-[90px]')}>
                    <span className="font-semibold">Ad preview: {placement}</span>
                    <span className="sm:hidden">full width × 280 (typical phone size)</span>
                    <span className="hidden sm:inline">728 × 90 (typical desktop size; responsive ads can be up to 280 tall)</span>
                </div>
            )}
        </aside>
    );
}

function AdUnit({ client, slot, format, className }: { client: string; slot: string; format: AdFormat; className?: string }) {
    const ref = useRef<HTMLModElement>(null);
    const requested = useRef(false);

    useEffect(() => {
        const ins = ref.current;
        // Once per element: a second push for the same <ins> throws "already have ads" (React dev runs effects twice).
        if (!ins || requested.current || ins.dataset.adsbygoogleStatus) return;
        requested.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle ?? []).push({});
        } catch {
            // AdSense reports its own errors in the console; a missing ad must never break the page.
        }
    }, []);

    return (
        <aside
            aria-label="Advertisement"
            className={cn('font-body has-[[data-ad-status=unfilled]]:hidden', FRAME[format], className)}
        >
            <AdLabel />
            {format === 'rail' ? (
                // Fixed size: the space is reserved, so nothing around the editor moves when the ad arrives.
                <ins
                    ref={ref}
                    className="adsbygoogle"
                    style={{ display: 'inline-block', ...RAIL }}
                    data-ad-client={client}
                    data-ad-slot={slot}
                />
            ) : (
                <ins
                    ref={ref}
                    className="adsbygoogle block min-h-[100px]"
                    style={{ display: 'block' }}
                    data-ad-client={client}
                    data-ad-slot={slot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            )}
        </aside>
    );
}
