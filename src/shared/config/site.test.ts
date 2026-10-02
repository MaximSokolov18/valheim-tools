import { describe, it, expect } from 'vitest';
import { ROUTES, SITE, absoluteUrl } from './site';

describe('absoluteUrl', () => {
    it('builds URLs on the production origin', () => {
        expect(absoluteUrl('/')).toBe('https://vikingtools.eu/');
        expect(absoluteUrl('/sign-editor')).toBe('https://vikingtools.eu/sign-editor');
    });
});

describe('ROUTES', () => {
    it('lists unique paths that start with a slash', () => {
        const paths = ROUTES.map((route) => route.path);
        expect(new Set(paths).size).toBe(paths.length);
        expect(paths.every((path) => path.startsWith('/'))).toBe(true);
    });

    it('includes the home page, the editor and every legal page', () => {
        const paths = ROUTES.map((route) => route.path);
        expect(paths).toEqual(
            expect.arrayContaining(['/', '/sign-editor', '/guides/sign-formatting', '/privacy', '/terms']),
        );
    });
});

describe('SITE', () => {
    it('names the brand without the game name', () => {
        expect(SITE.name).toBe('Viking Tools');
    });

    it('carries the non-affiliation disclaimer', () => {
        expect(SITE.disclaimer).toMatch(/not affiliated with, endorsed by or sponsored by/);
    });
});
