import Link from 'next/link';
import { SITE } from '../config/site';
import { NavLinks } from './nav-links';
import { ThemeToggle } from './theme-toggle';

// Fixed so pages that fill the viewport (the sign editor) can subtract it exactly.
export const SITE_HEADER_HEIGHT = '3.5rem';

const NAV_ITEMS = [
    { href: '/sign-editor', label: 'Sign Editor' },
    { href: '/guides/sign-formatting', label: 'Sign Tag Guide' },
] as const;

/** The design system's mark: a solid ink axe head. Decorative; the wordmark names the link. */
function AxeMark() {
    return (
        <svg viewBox="0 0 32 32" aria-hidden="true" className="hidden size-7 shrink-0 fill-current sm:block">
            <path d="M13 4h5v4.2c3.2-.4 6.6.6 9 3.3-1.6 4.9-3.8 8.8-8.2 11.4-.4-2.9-1.5-5-3.2-6.4h-.6V28a2 2 0 0 1-4 0V16.5c-2.1-.3-3.7-1.3-4.6-2.9L13 10.7z" />
        </svg>
    );
}

export function SiteHeader() {
    return (
        <header
            style={{ height: SITE_HEADER_HEIGHT }}
            className="relative z-20 border-b border-border bg-background/85 text-foreground backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
        >
            <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 whitespace-nowrap rounded-md font-heading text-[1rem] font-medium tracking-[-0.01em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-[1.3rem]"
                >
                    <AxeMark />
                    {SITE.name}
                </Link>
                <div className="flex items-center gap-0.5 sm:gap-3">
                    <nav aria-label="Main">
                        <NavLinks items={NAV_ITEMS} />
                    </nav>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
