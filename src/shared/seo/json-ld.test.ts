import { describe, it, expect } from 'vitest';
import { articleJsonLd, breadcrumbJsonLd, serializeJsonLd, signEditorAppJsonLd, websiteJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
    it('escapes "<" so a value cannot close the script tag', () => {
        const output = serializeJsonLd({ name: '</script><b>' });
        expect(output).not.toContain('<');
        expect(JSON.parse(output)).toEqual({ name: '</script><b>' });
    });
});

describe('websiteJsonLd', () => {
    it('describes the site with an absolute URL', () => {
        expect(websiteJsonLd()).toMatchObject({
            '@type': 'WebSite',
            name: 'Viking Tools',
            url: 'https://vikingtools.eu/',
        });
    });
});

describe('signEditorAppJsonLd', () => {
    it('describes a free web application at the editor URL', () => {
        expect(signEditorAppJsonLd()).toMatchObject({
            '@type': 'WebApplication',
            url: 'https://vikingtools.eu/sign-editor',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0' },
        });
    });
});

describe('breadcrumbJsonLd', () => {
    it('numbers items from 1 with absolute URLs', () => {
        const data = breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Sign Editor', path: '/sign-editor' },
        ]);
        expect(data).toMatchObject({
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vikingtools.eu/' },
                { '@type': 'ListItem', position: 2, name: 'Sign Editor', item: 'https://vikingtools.eu/sign-editor' },
            ],
        });
    });
});

describe('articleJsonLd', () => {
    it('carries dates, author and an absolute URL', () => {
        expect(
            articleJsonLd({
                headline: 'Guide',
                description: 'Desc',
                path: '/guides/sign-formatting',
                datePublished: '2026-10-02',
                dateModified: '2026-10-02',
            }),
        ).toMatchObject({
            '@type': 'TechArticle',
            url: 'https://vikingtools.eu/guides/sign-formatting',
            dateModified: '2026-10-02',
            author: { '@type': 'Person', name: 'Maksym Sokolov' },
        });
    });
});
