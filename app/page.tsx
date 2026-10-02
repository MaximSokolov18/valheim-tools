import type { Metadata } from 'next';
import HomePage from '@/_pages/home';
import { buildPageMetadata } from '@/shared/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
    title: 'Viking Tools | Free Sign Editor & Tools for Valheim',
    description:
        'Free browser tools for Valheim players. Style sign text with colours and emoji, check the character limit and copy it into the game.',
    path: '/',
});

export default function Page() {
    return <HomePage />;
}
