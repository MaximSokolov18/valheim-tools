import { SITE, absoluteUrl } from '../config/site';

export type JsonLdObject = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

const operatorJsonLd = (): JsonLdObject => ({ '@type': 'Person', name: SITE.operator.name });

// "<" is escaped so no value can terminate the surrounding <script> element.
export const serializeJsonLd = (data: JsonLdObject): string => JSON.stringify(data).replace(/</g, '\\u003c');

export const websiteJsonLd = (): JsonLdObject => ({
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: SITE.name,
    url: absoluteUrl('/'),
    inLanguage: SITE.language,
    publisher: operatorJsonLd(),
});

export const signEditorAppJsonLd = (): JsonLdObject => ({
    '@context': CONTEXT,
    '@type': 'WebApplication',
    name: `${SITE.name} Sign Editor`,
    url: absoluteUrl('/sign-editor'),
    description:
        'Browser-based editor for Valheim sign text with colors and emoji.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (web browser)',
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    author: operatorJsonLd(),
    featureList: ['Text colors', 'Emoji picker', '50-character limit check', 'One-click copy for Valheim'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
});

export const breadcrumbJsonLd = (items: readonly { name: string; path: string }[]): JsonLdObject => ({
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
    })),
});

type ArticleInput = {
    headline: string;
    description: string;
    path: string;
    datePublished: string;
    dateModified: string;
};

export const articleJsonLd = ({ headline, description, path, datePublished, dateModified }: ArticleInput): JsonLdObject => ({
    '@context': CONTEXT,
    '@type': 'TechArticle',
    headline,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified,
    inLanguage: SITE.language,
    author: operatorJsonLd(),
    publisher: operatorJsonLd(),
});
