import { describe, it, expect } from 'vitest';
import { ROUTES } from '../config/site';
import { buildRobots, buildSitemap } from './sitemap';

describe('buildSitemap', () => {
    it('emits one absolute entry per route', () => {
        const entries = buildSitemap();
        expect(entries).toHaveLength(ROUTES.length);
        expect(entries.map((entry) => entry.url)).toContain('https://vikingtools.eu/sign-editor');
        expect(entries.every((entry) => entry.url.startsWith('https://vikingtools.eu/'))).toBe(true);
    });

    it('uses the recorded modification date, not the build time', () => {
        expect(buildSitemap()[0].lastModified).toBe(ROUTES[0].lastModified);
    });
});

describe('buildRobots', () => {
    it('allows everything and points at the sitemap', () => {
        expect(buildRobots()).toEqual({
            rules: [{ userAgent: '*', allow: '/' }],
            sitemap: 'https://vikingtools.eu/sitemap.xml',
        });
    });
});
