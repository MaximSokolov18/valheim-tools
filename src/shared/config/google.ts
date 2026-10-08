/**
 * Google AdSense, Google Analytics and the Google consent message (Privacy & messaging).
 *
 * IDs come from build-time env vars (see docs/compliance/google-ads-analytics.md). They are public values, not
 * secrets, but they live in env so local, test and fork builds ship no Google code at all. Each value is checked
 * against its expected shape, because it ends up in script URLs: anything else counts as "not set".
 *
 * Nothing Google loads without the consent message. No publisher ID means no message, so no analytics or ads either.
 */

const pick = (value: string | undefined, pattern: RegExp): string | undefined => {
    const trimmed = value?.trim();
    return trimmed && pattern.test(trimmed) ? trimmed : undefined;
};

export const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
export const ADSENSE_PUBLISHER_ID_PATTERN = /^pub-\d{10,20}$/;
export const AD_SLOT_ID_PATTERN = /^\d{5,20}$/;

/** Google's ID in the IAB Global Vendor List (TCF). */
export const GOOGLE_TCF_VENDOR_ID = 755;

/** Hosts of the scripts we inject. Kept here so tests and the CSP notes have one source. */
export const GOOGLE_SCRIPT_URLS = {
    consentMessage: (publisherId: string) =>
        `https://fundingchoicesmessages.google.com/i/${publisherId}?ers=1`,
    analytics: (measurementId: string) =>
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
    adsense: (publisherId: string) =>
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${publisherId}`,
} as const;

export type AdPlacement = 'home' | 'guide' | 'editor' | 'editorRail';

export type GoogleConfig = {
    /** AdSense publisher ID, `pub-` + digits. Also drives the consent message. */
    publisherId?: string;
    /** GA4 measurement ID, `G-...`. */
    measurementId?: string;
    /** AdSense ad unit IDs per placement; a placement without one shows no ad. */
    adSlots: Partial<Record<AdPlacement, string>>;
};

/** `process.env.NEXT_PUBLIC_*` must be read literally so Next inlines the values at build time. */
export function readGoogleConfig(env: Record<string, string | undefined> = {
    NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_ADSENSE_SLOT_HOME: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME,
    NEXT_PUBLIC_ADSENSE_SLOT_GUIDE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE,
    NEXT_PUBLIC_ADSENSE_SLOT_EDITOR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_EDITOR,
    NEXT_PUBLIC_ADSENSE_SLOT_EDITOR_RAIL: process.env.NEXT_PUBLIC_ADSENSE_SLOT_EDITOR_RAIL,
}): GoogleConfig {
    return {
        publisherId: pick(env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID, ADSENSE_PUBLISHER_ID_PATTERN),
        measurementId: pick(env.NEXT_PUBLIC_GA_MEASUREMENT_ID, GA_MEASUREMENT_ID_PATTERN),
        adSlots: {
            home: pick(env.NEXT_PUBLIC_ADSENSE_SLOT_HOME, AD_SLOT_ID_PATTERN),
            guide: pick(env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE, AD_SLOT_ID_PATTERN),
            editor: pick(env.NEXT_PUBLIC_ADSENSE_SLOT_EDITOR, AD_SLOT_ID_PATTERN),
            editorRail: pick(env.NEXT_PUBLIC_ADSENSE_SLOT_EDITOR_RAIL, AD_SLOT_ID_PATTERN),
        },
    };
}

export const GOOGLE = readGoogleConfig();

/** ads.txt body: authorises Google to sell our ad space. Without a publisher ID it authorises nobody. */
export function buildAdsTxt(publisherId: string | undefined): string {
    if (!publisherId) return '# No sellers are authorised for this site.\n';
    // f08c47fec0942fa0 is Google's TAG-ID (certification authority ID) for google.com.
    return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
}
