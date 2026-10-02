import type { MetadataRoute } from 'next';
import { buildRobots } from '@/shared/seo/sitemap';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return buildRobots();
}
