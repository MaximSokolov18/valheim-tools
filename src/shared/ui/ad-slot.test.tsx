import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { consentStore } from '../lib/consent';

vi.mock('../config/google', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../config/google')>();
    return {
        ...actual,
        GOOGLE: { publisherId: 'pub-1234567890123456', measurementId: undefined, adSlots: { guide: '1234567890', editorRail: '2234567890' } },
    };
});

const { AdSlot } = await import('./ad-slot');

describe('AdSlot', () => {
    afterEach(() => {
        consentStore.reset();
        delete window.adsbygoogle;
    });

    it('renders nothing without ad consent', () => {
        const { container } = render(<AdSlot placement="guide" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing for a placement without an ad unit', () => {
        act(() => consentStore.set({ ads: true }));
        const { container } = render(<AdSlot placement="home" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('shows a labelled ad unit and requests one ad once consent is given', () => {
        render(<AdSlot placement="guide" />);
        act(() => consentStore.set({ ads: true }));

        const ad = screen.getByRole('complementary', { name: 'Advertisement' });
        const ins = ad.querySelector('ins.adsbygoogle');
        expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-1234567890123456');
        expect(ins).toHaveAttribute('data-ad-slot', '1234567890');
        expect(window.adsbygoogle).toHaveLength(1);
    });

    it('renders a fixed 160x600 rail unit only while its media query matches', () => {
        let matches = false;
        const listeners = new Set<() => void>();
        vi.stubGlobal('matchMedia', (query: string) => ({
            media: query,
            get matches() { return matches; },
            addEventListener: (_: string, cb: () => void) => listeners.add(cb),
            removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
        }));
        try {
            act(() => consentStore.set({ ads: true }));
            const { container } = render(<AdSlot placement="editorRail" format="rail" media="(min-width: 1536px)" />);
            expect(container).toBeEmptyDOMElement();

            matches = true;
            act(() => listeners.forEach((cb) => cb()));
            const ins = container.querySelector('ins.adsbygoogle') as HTMLElement;
            expect(ins).toHaveAttribute('data-ad-slot', '2234567890');
            expect(ins).not.toHaveAttribute('data-ad-format');
            expect(ins.style.width).toBe('160px');
            expect(ins.style.height).toBe('600px');
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('shows a preview box in development, without consent or Google', () => {
        vi.stubEnv('NODE_ENV', 'development');
        try {
            render(<AdSlot placement="home" />);
            expect(screen.getByText('Ad preview: home')).toBeInTheDocument();
            expect(window.adsbygoogle).toBeUndefined();
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
