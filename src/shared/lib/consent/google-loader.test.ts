import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GoogleConfig } from '../../config/google';
import { consentStore } from './consent-store';
import { clearGoogleCookies, resetGoogleServicesForTests, startGoogleServices } from './google-loader';
import type { TcData } from './tcf';

const CONFIG: GoogleConfig = {
    publisherId: 'pub-1234567890123456',
    measurementId: 'G-TEST1234',
    adSlots: { guide: '1234567890' },
};

const scriptSources = () => Array.from(document.head.querySelectorAll('script')).map((script) => script.src);

type Listener = (tcData: TcData, success: boolean) => void;

/** Simulates Google's consent message: runs the queued CONSENT_API_READY callback with a fake TCF API. */
function fakeConsentMessage() {
    let listener: Listener | undefined;
    window.__tcfapi = vi.fn((command: string, _version: number, callback: Listener) => {
        if (command === 'addEventListener') listener = callback;
    });
    window.googlefc!.callbackQueue!.forEach((entry) => entry.CONSENT_API_READY?.());
    return {
        emit: (tcData: TcData) => listener?.({ listenerId: 1, cmpStatus: 'loaded', ...tcData }, true),
    };
}

const accept = (purposes: number[]): TcData => ({
    gdprApplies: true,
    eventStatus: 'useractioncomplete',
    purpose: { consents: Object.fromEntries(purposes.map((id) => [id, true])) },
    vendor: { consents: { 755: true } },
});

describe('startGoogleServices', () => {
    beforeEach(() => {
        resetGoogleServicesForTests();
        consentStore.reset();
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        delete window.googlefc;
        delete window.__tcfapi;
        delete window.gtag;
        delete window.dataLayer;
        delete window.adsbygoogle;
    });

    afterEach(() => vi.restoreAllMocks());

    it('does nothing without a publisher ID', () => {
        startGoogleServices({ adSlots: {} });
        expect(scriptSources()).toEqual([]);
        expect(window.googlefc).toBeUndefined();
    });

    it('loads only the consent message before the visitor decides', () => {
        startGoogleServices(CONFIG);
        expect(scriptSources()).toEqual(['https://fundingchoicesmessages.google.com/i/pub-1234567890123456?ers=1']);
        expect(document.querySelector('iframe[name="googlefcPresent"]')).not.toBeNull();

        fakeConsentMessage().emit({ gdprApplies: true, eventStatus: 'cmpuishown' });
        expect(scriptSources()).toHaveLength(1);
        expect(consentStore.get()).toMatchObject({ ads: false, analytics: false, canReopen: true });
    });

    it('loads nothing more when the visitor rejects', () => {
        startGoogleServices(CONFIG);
        fakeConsentMessage().emit(accept([]));
        expect(scriptSources()).toHaveLength(1);
        expect(window.gtag).toBeUndefined();
    });

    it('loads Analytics, privacy-limited, and AdSense after consent', () => {
        startGoogleServices(CONFIG);
        fakeConsentMessage().emit(accept([1, 8]));

        expect(scriptSources()).toEqual([
            'https://fundingchoicesmessages.google.com/i/pub-1234567890123456?ers=1',
            'https://www.googletagmanager.com/gtag/js?id=G-TEST1234',
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456',
        ]);
        const calls = window.dataLayer!.map((args) => Array.from(args as ArrayLike<unknown>));
        expect(calls).toContainEqual(['consent', 'default', expect.objectContaining({ ad_storage: 'denied', ad_personalization: 'denied' })]);
        expect(calls).toContainEqual(['config', 'G-TEST1234', expect.objectContaining({ allow_google_signals: false })]);
        expect(consentStore.get()).toMatchObject({ ads: true, analytics: true });
    });

    it('skips AdSense when no ad unit is configured', () => {
        startGoogleServices({ ...CONFIG, adSlots: {} });
        fakeConsentMessage().emit(accept([1, 8]));
        expect(scriptSources().some((src) => src.includes('adsbygoogle'))).toBe(false);
    });

    it('loads nothing for visitors outside consent law who send Global Privacy Control', () => {
        Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
        try {
            startGoogleServices(CONFIG);
            fakeConsentMessage().emit({ gdprApplies: false, eventStatus: 'tcloaded' });
            expect(scriptSources()).toHaveLength(1);
        } finally {
            delete (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl;
        }
    });

    it('loads both for visitors outside consent law without Global Privacy Control', () => {
        startGoogleServices(CONFIG);
        fakeConsentMessage().emit({ gdprApplies: false, eventStatus: 'tcloaded' });
        expect(scriptSources()).toHaveLength(3);
        expect(consentStore.get().canReopen).toBe(false);
    });
});

describe('clearGoogleCookies', () => {
    it('removes Google cookies and keeps others', () => {
        document.cookie = '_ga=GA1.1.1; path=/';
        document.cookie = '_ga_TEST1234=GS1; path=/';
        document.cookie = '__gads=ID; path=/';
        document.cookie = 'keep=1; path=/';
        clearGoogleCookies();
        expect(document.cookie).toBe('keep=1');
    });
});
