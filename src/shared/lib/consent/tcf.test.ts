import { describe, expect, it } from 'vitest';
import { decideConsent, isWithdrawal, NO_CONSENT, type TcData } from './tcf';

const consented = (purposes: number[], google = true): TcData => ({
    gdprApplies: true,
    cmpStatus: 'loaded',
    eventStatus: 'useractioncomplete',
    purpose: { consents: Object.fromEntries(purposes.map((id) => [id, true])) },
    vendor: { consents: { 755: google } },
});

describe('decideConsent', () => {
    it('waits while the banner is open', () => {
        expect(decideConsent({ gdprApplies: true, cmpStatus: 'loaded', eventStatus: 'cmpuishown' })).toBeNull();
    });

    it('allows nothing when the consent tool fails or sends nothing', () => {
        expect(decideConsent(undefined)).toEqual(NO_CONSENT);
        expect(decideConsent({ cmpStatus: 'error', eventStatus: 'tcloaded' })).toEqual(NO_CONSENT);
    });

    it('allows nothing when the visitor rejects everything', () => {
        expect(decideConsent(consented([], false))).toEqual(NO_CONSENT);
    });

    it('allows nothing without consent for Google as a vendor', () => {
        expect(decideConsent(consented([1, 2, 3, 4, 7, 8, 9, 10], false))).toEqual(NO_CONSENT);
    });

    it('needs device storage (purpose 1) for anything', () => {
        expect(decideConsent(consented([2, 7, 8, 9]))).toEqual(NO_CONSENT);
    });

    it('allows ads but not analytics with purpose 1 alone', () => {
        expect(decideConsent(consented([1]))).toEqual({ ads: true, analytics: false });
    });

    it('allows analytics with purposes 1 and 8', () => {
        expect(decideConsent(consented([1, 8]))).toEqual({ ads: true, analytics: true });
    });

    it('treats an unknown gdprApplies as "consent law applies"', () => {
        const data = consented([]);
        delete data.gdprApplies;
        expect(decideConsent(data)).toEqual(NO_CONSENT);
    });

    it('allows both where consent law does not apply, unless Global Privacy Control is on', () => {
        const outside: TcData = { gdprApplies: false, cmpStatus: 'loaded', eventStatus: 'tcloaded' };
        expect(decideConsent(outside)).toEqual({ ads: true, analytics: true });
        expect(decideConsent(outside, true)).toEqual(NO_CONSENT);
    });
});

describe('isWithdrawal', () => {
    it('is true only when something allowed is taken away', () => {
        expect(isWithdrawal({ ads: true, analytics: true }, { ads: true, analytics: false })).toBe(true);
        expect(isWithdrawal({ ads: true, analytics: false }, { ads: false, analytics: false })).toBe(true);
        expect(isWithdrawal(NO_CONSENT, { ads: true, analytics: true })).toBe(false);
        expect(isWithdrawal({ ads: true, analytics: true }, { ads: true, analytics: true })).toBe(false);
    });
});
