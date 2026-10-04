import type { Metadata } from 'next';
import SignGuidePage from '@/_pages/sign-guide';
import { buildPageMetadata } from '@/shared/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
    title: 'Sign Tag Guide for Valheim: Colors & Limits | Viking Tools',
    description:
        'Every tag a Valheim sign accepts, what it costs against the 50-character limit, and how color, underline and size tags behave in game.',
    path: '/guides/sign-formatting',
});

export default function Page() {
    return <SignGuidePage />;
}
