import { describe, expect, it } from 'vitest';
import { buildAdsTxt, GOOGLE_SCRIPT_URLS, readGoogleConfig } from './google';

describe('readGoogleConfig', () => {
    it('is empty when nothing is set, so no Google code ships', () => {
        expect(readGoogleConfig({})).toEqual({
            publisherId: undefined,
            measurementId: undefined,
            adSlots: { home: undefined, guide: undefined, editor: undefined, editorRail: undefined },
        });
    });

    it('accepts well-formed IDs and trims whitespace', () => {
        const config = readGoogleConfig({
            NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: ' pub-1234567890123456 ',
            NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-ABC123XYZ9',
            NEXT_PUBLIC_ADSENSE_SLOT_GUIDE: '1234567890',
        });
        expect(config.publisherId).toBe('pub-1234567890123456');
        expect(config.measurementId).toBe('G-ABC123XYZ9');
        expect(config.adSlots.guide).toBe('1234567890');
    });

    it('rejects anything that is not the expected shape (it ends up in script URLs)', () => {
        const config = readGoogleConfig({
            NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: 'ca-pub-1234567890123456',
            NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-ABC"><script>',
            NEXT_PUBLIC_ADSENSE_SLOT_HOME: '123abc',
        });
        expect(config.publisherId).toBeUndefined();
        expect(config.measurementId).toBeUndefined();
        expect(config.adSlots.home).toBeUndefined();
    });
});

describe('buildAdsTxt', () => {
    it('authorises Google for the publisher ID', () => {
        expect(buildAdsTxt('pub-1234567890123456')).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    });

    it('authorises nobody without a publisher ID', () => {
        expect(buildAdsTxt(undefined)).not.toMatch(/google\.com/);
    });
});

describe('GOOGLE_SCRIPT_URLS', () => {
    it('only points at Google hosts over HTTPS', () => {
        expect(GOOGLE_SCRIPT_URLS.consentMessage('pub-1')).toMatch(/^https:\/\/fundingchoicesmessages\.google\.com\//);
        expect(GOOGLE_SCRIPT_URLS.analytics('G-ABCD')).toMatch(/^https:\/\/www\.googletagmanager\.com\//);
        expect(GOOGLE_SCRIPT_URLS.adsense('pub-1')).toMatch(/^https:\/\/pagead2\.googlesyndication\.com\/.*client=ca-pub-1$/);
    });
});
