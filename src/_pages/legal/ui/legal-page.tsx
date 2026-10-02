import type { ReactNode } from 'react';
import { SITE } from '../../../shared/config/site';
import { SiteShell } from '../../../shared/ui/site-shell';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
    return (
        <SiteShell>
            <article className="max-w-3xl [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-heading [&_h2]:mt-8 [&_h2]:text-2xl [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <h1 className="font-heading text-4xl sm:text-5xl">{title}</h1>
                <p className="mt-3 text-muted-foreground">Last updated: {SITE.legalUpdated}</p>
                {children}
            </article>
        </SiteShell>
    );
}
