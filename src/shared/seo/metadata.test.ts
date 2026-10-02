import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from './metadata';

describe('buildPageMetadata', () => {
    const metadata = buildPageMetadata({
        title: 'Sign Editor | Viking Tools',
        description: 'A description.',
        path: '/sign-editor',
    });

    it('uses the title as-is, without a template', () => {
        expect(metadata.title).toEqual({ absolute: 'Sign Editor | Viking Tools' });
    });

    it('sets the canonical URL relative to metadataBase', () => {
        expect(metadata.alternates?.canonical).toBe('/sign-editor');
    });

    it('mirrors title, description and absolute URL into Open Graph', () => {
        expect(metadata.openGraph).toMatchObject({
            title: 'Sign Editor | Viking Tools',
            description: 'A description.',
            url: 'https://vikingtools.eu/sign-editor',
            siteName: 'Viking Tools',
            type: 'website',
        });
    });

    it('carries the generated share images on Open Graph and Twitter', () => {
        expect(metadata.openGraph).toMatchObject({
            images: [
                {
                    url: '/opengraph-image',
                    width: 1200,
                    height: 630,
                    alt: 'Viking Tools: free sign editor and tools for Valheim players',
                },
            ],
        });
        expect(metadata.twitter).toMatchObject({ images: ['/twitter-image'] });
    });

    it('uses a large Twitter card with the same title', () => {
        expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Sign Editor | Viking Tools' });
    });
});
