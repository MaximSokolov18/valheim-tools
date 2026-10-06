export type SiteRoute = {
    path: string;
    lastModified: string;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
    priority: number;
};

export const SITE = {
    name: 'Viking Tools',
    url: 'https://vikingtools.eu',
    language: 'en',
    locale: 'en_US',
    description:
        'Free browser tools for Valheim players. Style sign text with colors and emoji, check the character limit and copy it into the game.',
    disclaimer:
        'Viking Tools is an unofficial fan-made project. It is not affiliated with, endorsed by or sponsored by Iron Gate AB or Coffee Stain Publishing. Valheim and related names are trademarks of their respective owners.',
    socialImageAlt: 'Viking Tools: free sign editor and tools for Valheim players',
    /** Year the site was first published. Fixed on purpose: a static export would freeze `new Date()` at build time. */
    copyrightYear: '2026',
    legalUpdated: '4 October 2026',
    operator: {
        name: 'Maksym Sokolov',
        country: 'Spain',
        contactEmail: 'makssokolov107@gmail.com',
    },
} as const;

/** Where players can tip the project. Shown in the header's support dialog. */
export const SUPPORT_LINKS = [
    { id: 'ko-fi', name: 'Ko-fi', href: 'https://ko-fi.com/vikingtools', host: 'ko-fi.com' },
    { id: 'buy-me-a-coffee', name: 'Buy Me a Coffee', href: 'https://buymeacoffee.com/makssokoloh', host: 'buymeacoffee.com' },
] as const;

export const ROUTES: readonly SiteRoute[] = [
    { path: '/', lastModified: '2026-10-03', changeFrequency: 'monthly', priority: 1 },
    { path: '/sign-editor', lastModified: '2026-10-03', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/guides/sign-formatting', lastModified: '2026-10-03', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/privacy', lastModified: '2026-10-03', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', lastModified: '2026-10-03', changeFrequency: 'yearly', priority: 0.3 },
];

export const absoluteUrl = (path: string): string => new URL(path, SITE.url).toString();
