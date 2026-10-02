import Link from 'next/link';
import { SITE } from '../config/site';

// Fixed so pages that fill the viewport (the sign editor) can subtract it exactly.
export const SITE_HEADER_HEIGHT = '3.5rem';

const NAV_ITEMS = [
    { href: '/sign-editor', label: 'Sign Editor' },
    { href: '/guides/sign-formatting', label: 'Sign Tag Guide' },
] as const;

export function SiteHeader() {
    return (
        <header style={{ height: SITE_HEADER_HEIGHT }} className="border-b border-border bg-card text-card-foreground">
            <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-4">
                <Link href="/" className="font-heading text-2xl">
                    {SITE.name}
                </Link>
                <nav aria-label="Main">
                    <ul className="font-body flex gap-4 text-base">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="underline-offset-4 hover:underline">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
