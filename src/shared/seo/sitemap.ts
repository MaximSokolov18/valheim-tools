import type { MetadataRoute } from 'next';
import { ROUTES, absoluteUrl } from '../config/site';

export const buildSitemap = (): MetadataRoute.Sitemap =>
    ROUTES.map((route) => ({
        url: absoluteUrl(route.path),
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));

export const buildRobots = (): MetadataRoute.Robots => ({
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
});
