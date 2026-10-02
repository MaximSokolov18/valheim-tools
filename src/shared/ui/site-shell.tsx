import type { ReactNode } from 'react';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

export function SiteShell({ children }: { children: ReactNode }) {
    return (
        <>
            <SiteHeader />
            <main id="main-content" tabIndex={-1} className="font-body mx-auto w-full max-w-5xl flex-1 px-4 py-10">
                {children}
            </main>
            <SiteFooter />
        </>
    );
}
