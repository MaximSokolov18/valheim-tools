import type { ReactNode } from 'react';
import { SITE } from '../../../shared/config/site';
import { SiteShell } from '../../../shared/ui/site-shell';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
    return (
        <SiteShell>
            <article className="mx-auto max-w-3xl text-[0.85rem] leading-relaxed [&_a]:underline [&_a]:decoration-foreground/35 [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:text-[1.4rem] [&_h2]:font-medium [&_p]:mt-3 [&_strong]:font-semibold [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:marker:text-brand-text">
                <h1 className="border-b-2 border-foreground pb-5 font-heading text-[2.4rem] leading-tight font-normal tracking-[-0.02em] sm:text-[3rem]">{title}</h1>
                <p className="mt-4 text-[0.75rem] text-muted-foreground">Last updated: {SITE.legalUpdated}</p>
                {children}
            </article>
        </SiteShell>
    );
}
