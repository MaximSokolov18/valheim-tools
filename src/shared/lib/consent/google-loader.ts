import { GOOGLE_SCRIPT_URLS, type GoogleConfig } from '../../config/google';
import { consentStore } from './consent-store';
import { decideConsent, isWithdrawal, NO_CONSENT, noRegulationDecision, type ConsentDecision, type TcData } from './tcf';

type TcfApi = (
    command: 'addEventListener' | 'removeEventListener',
    version: number,
    callback: (tcData: TcData, success: boolean) => void,
    parameter?: number,
) => void;

type GoogleFcCallback = Partial<Record<'CONSENT_API_READY' | 'CONSENT_DATA_READY', () => void>>;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        adsbygoogle?: unknown[];
        googlefc?: { callbackQueue?: GoogleFcCallback[]; showRevocationMessage?: () => void };
        __tcfapi?: TcfApi;
    }
    interface Navigator {
        globalPrivacyControl?: boolean;
    }
}

/** Cookies Google Analytics and AdSense set on our own domain. Removed when consent is withdrawn. */
const GOOGLE_COOKIE = /^(_ga(_.+)?|_gid|_gat.*|__gads|__gpi|__eoi|_gcl_.+)$/;

/** TCF API version argument: 0 means "the latest the CMP supports" (Google's Privacy & messaging docs). */
const TCF_VERSION = 0;

/** Lifetime of the Analytics cookies: 395 days (about 13 months). */
export const ANALYTICS_COOKIE_SECONDS = 395 * 24 * 60 * 60;

let config: GoogleConfig | undefined;
/** What has actually been injected into the page. Scripts cannot be unloaded, so this only grows until a reload. */
let loaded: ConsentDecision = NO_CONSENT;
let tcfListenerId: number | undefined;

/**
 * Loads Google's consent message and, once the visitor has decided, Analytics and AdSense as allowed.
 * Before a decision nothing but the consent message loads. If the message is blocked or fails, nothing else
 * loads either. Safe to call more than once; only the first call does anything.
 */
export function startGoogleServices(next: GoogleConfig): void {
    if (config || !next.publisherId || typeof window === 'undefined') return;
    config = next;

    window.googlefc = window.googlefc ?? {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? [];
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: subscribeToConsent });

    injectScript(GOOGLE_SCRIPT_URLS.consentMessage(next.publisherId));
    signalGooglefcPresent();
}

/** Shows the consent message again so the visitor can change or withdraw consent. False if it is not ready. */
export function reopenConsentMessage(): boolean {
    const fc = window.googlefc;
    if (typeof fc?.showRevocationMessage !== 'function') return false;
    fc.showRevocationMessage();
    // The message script reloads itself; listen again once its API is back.
    fc.callbackQueue?.push({ CONSENT_DATA_READY: subscribeToConsent });
    return true;
}

function subscribeToConsent(): void {
    const tcfapi = window.__tcfapi;
    if (typeof tcfapi !== 'function') {
        // No TCF API on this page view: no consent message applies to this visitor (outside the EEA/UK/CH).
        apply(noRegulationDecision(navigator.globalPrivacyControl === true));
        return;
    }
    if (tcfListenerId !== undefined) {
        try {
            tcfapi('removeEventListener', TCF_VERSION, () => {}, tcfListenerId);
        } catch {
            // The old API may be gone after the message script reloaded; nothing to remove then.
        }
    }
    tcfapi('addEventListener', TCF_VERSION, (tcData, success) => {
        if (!success) {
            apply(NO_CONSENT);
            return;
        }
        tcfListenerId = tcData.listenerId;
        consentStore.set({ canReopen: tcData.gdprApplies !== false });
        const decision = decideConsent(tcData, navigator.globalPrivacyControl === true);
        if (decision) apply(decision);
    });
}

function apply(decision: ConsentDecision): void {
    if (!config) return;

    if (isWithdrawal(loaded, decision)) {
        // Loaded scripts cannot be switched off reliably. Remove their cookies and start clean.
        clearGoogleCookies();
        window.location.reload();
        return;
    }

    const wantsAnalytics = decision.analytics && Boolean(config.measurementId);
    const wantsAds = decision.ads && Boolean(config.publisherId) && Object.values(config.adSlots).some(Boolean);

    if (wantsAnalytics && !loaded.analytics) loadAnalytics(config.measurementId!);
    if (wantsAds && !loaded.ads) loadAds(config.publisherId!);

    loaded = { analytics: loaded.analytics || wantsAnalytics, ads: loaded.ads || wantsAds };
    consentStore.set({ analytics: wantsAnalytics, ads: wantsAds });
}

function loadAnalytics(measurementId: string): void {
    window.dataLayer = window.dataLayer ?? [];
    // gtag.js expects the `arguments` object itself, not an array.
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
    };
    // Analytics only: no advertising use of Analytics data, no Google signals.
    window.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_flags: 'samesite=lax;secure',
        // 13 months instead of the default 2 years, as stated in the privacy policy.
        cookie_expires: ANALYTICS_COOKIE_SECONDS,
    });
    injectScript(GOOGLE_SCRIPT_URLS.analytics(measurementId));
}

function loadAds(publisherId: string): void {
    window.adsbygoogle = window.adsbygoogle ?? [];
    injectScript(GOOGLE_SCRIPT_URLS.adsense(publisherId), 'anonymous');
}

function injectScript(src: string, crossOrigin?: 'anonymous'): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (crossOrigin) script.crossOrigin = crossOrigin;
    document.head.appendChild(script);
}

/** Google's "googlefcPresent" signal: a hidden named frame telling ad code that the consent message is on the page. */
function signalGooglefcPresent(): void {
    if ((window.frames as unknown as Record<string, unknown>).googlefcPresent) return;
    if (!document.body) {
        setTimeout(signalGooglefcPresent, 0);
        return;
    }
    const iframe = document.createElement('iframe');
    iframe.name = 'googlefcPresent';
    iframe.title = 'googlefcPresent';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;left:-1000px;top:-1000px;z-index:-1000';
    document.body.appendChild(iframe);
}

export function clearGoogleCookies(): void {
    const names = document.cookie
        .split(';')
        .map((cookie) => cookie.split('=')[0].trim())
        .filter((name) => GOOGLE_COOKIE.test(name));
    const labels = location.hostname.split('.');
    // vikingtools.eu, .vikingtools.eu, and every parent of a subdomain: GA sets its cookies on the top domain.
    const domains = ['', ...labels.slice(0, -1).map((_, index) => `.${labels.slice(index).join('.')}`)];
    for (const name of names) {
        for (const domain of domains) {
            document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
        }
    }
}

/** Tests only. */
export function resetGoogleServicesForTests(): void {
    config = undefined;
    loaded = NO_CONSENT;
    tcfListenerId = undefined;
}
