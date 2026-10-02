import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import SignEditor, { SignEditorInfo } from '@/_pages/sign-editor';
import { buildPageMetadata } from '@/shared/seo/metadata';
import { breadcrumbJsonLd, signEditorAppJsonLd } from '@/shared/seo/json-ld';
import { JsonLd } from '@/shared/ui/json-ld';
import { SiteFooter } from '@/shared/ui/site-footer';
import { SITE_HEADER_HEIGHT, SiteHeader } from '@/shared/ui/site-header';

export const metadata: Metadata = buildPageMetadata({
    title: 'Sign Editor for Valheim: Colour, Size & Emoji | Viking Tools',
    description:
        'Design Valheim sign text with colours, sizes and emoji. Stay within the 50-character limit and copy the finished text straight into the game.',
    path: '/sign-editor',
});

export default function SignEditorRoute() {
    return (
        <>
            <JsonLd data={signEditorAppJsonLd()} />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Sign Editor', path: '/sign-editor' },
                ])}
            />
            <SiteHeader />
            <main
                id="main-content"
                tabIndex={-1}
                style={{ '--site-header-height': SITE_HEADER_HEIGHT } as CSSProperties}
            >
                <h1 className="sr-only">Sign Editor for Valheim</h1>
                <SignEditor />
                <SignEditorInfo />
            </main>
            <SiteFooter />
        </>
    );
}
