import type { MetadataRoute } from 'next';
import { SITE } from '@/shared/config/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE.name,
        short_name: SITE.name,
        description: SITE.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#e4e5f1',
        theme_color: '#484b6a',
    };
}
