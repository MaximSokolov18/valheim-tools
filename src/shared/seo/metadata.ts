import type { Metadata } from 'next';
import { SITE, absoluteUrl } from '../config/site';

type PageMetadataInput = {
    title: string;
    description: string;
    path: string;
};

export const buildPageMetadata = ({ title, description, path }: PageMetadataInput): Metadata => ({
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
        title,
        description,
        url: absoluteUrl(path),
        siteName: SITE.name,
        locale: SITE.locale,
        type: 'website',
        images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.socialImageAlt }],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/twitter-image'],
    },
});
