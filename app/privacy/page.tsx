import type { Metadata } from 'next';
import { PrivacyPage } from '@/_pages/legal';
import { buildPageMetadata } from '@/shared/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
    title: 'Privacy Policy | Viking Tools',
    description: 'How Viking Tools handles personal data, and the rights you have. The site uses no cookies, analytics or advertising.',
    path: '/privacy',
});

export default function Page() {
    return <PrivacyPage />;
}
