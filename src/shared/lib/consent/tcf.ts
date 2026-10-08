import { GOOGLE_TCF_VENDOR_ID } from '../../config/google';

/** The parts of an IAB TCF v2.2 `TCData` object we read. */
export type TcData = {
    gdprApplies?: boolean;
    cmpStatus?: 'stub' | 'loading' | 'loaded' | 'error';
    eventStatus?: 'tcloaded' | 'cmpuishown' | 'useractioncomplete';
    listenerId?: number;
    purpose?: { consents?: Record<string, boolean | undefined> };
    vendor?: { consents?: Record<string, boolean | undefined> };
};

/** What the visitor allows us to load. Both false is the default and the fallback for anything unclear. */
export type ConsentDecision = {
    ads: boolean;
    analytics: boolean;
};

export const NO_CONSENT: ConsentDecision = Object.freeze({ ads: false, analytics: false });

/** TCF purposes: 1 = store/access information on a device, 8 = measure content performance. */
const STORE_ON_DEVICE = 1;
const MEASURE_CONTENT = 8;

/**
 * Turns a TCF event into what may load. Returns `null` while the visitor has not decided yet (banner open).
 *
 * - Consent law applies (or we cannot tell): Google must have vendor consent plus purpose 1. Ads need just that
 *   (AdSense reads the rest of the TC string itself to pick personalised or non-personalised ads); analytics also
 *   needs purpose 8.
 * - Consent law does not apply (visitor outside the EEA/UK/Switzerland): load, unless the browser sends a Global
 *   Privacy Control signal, which we treat as an opt-out of both.
 */
export function decideConsent(tcData: TcData | null | undefined, globalPrivacyControl = false): ConsentDecision | null {
    if (!tcData || tcData.cmpStatus === 'error') return NO_CONSENT;
    if (tcData.eventStatus !== 'tcloaded' && tcData.eventStatus !== 'useractioncomplete') return null;

    if (tcData.gdprApplies === false) return noRegulationDecision(globalPrivacyControl);

    const purpose = (id: number) => tcData.purpose?.consents?.[id] === true;
    const google = tcData.vendor?.consents?.[GOOGLE_TCF_VENDOR_ID] === true;
    const storage = google && purpose(STORE_ON_DEVICE);
    return { ads: storage, analytics: storage && purpose(MEASURE_CONTENT) };
}

/** Where no consent message applies, Global Privacy Control still counts as "no". */
export function noRegulationDecision(globalPrivacyControl: boolean): ConsentDecision {
    return globalPrivacyControl ? NO_CONSENT : { ads: true, analytics: true };
}

/** True when `next` takes away something `current` allowed (a withdrawal). */
export function isWithdrawal(current: ConsentDecision, next: ConsentDecision): boolean {
    return (current.ads && !next.ads) || (current.analytics && !next.analytics);
}
