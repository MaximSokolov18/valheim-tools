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
        background_color: '#12110f',
        theme_color: '#12110f',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
