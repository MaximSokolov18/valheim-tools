import type { Metadata } from 'next';
import { TermsPage } from '@/_pages/legal';
import { buildPageMetadata } from '@/shared/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
    title: 'Terms of Use | Viking Tools',
    description: 'The rules for using Viking Tools, including the unofficial fan-project notice and limits of liability.',
    path: '/terms',
});

export default function Page() {
    return <TermsPage />;
}
