'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib';

/** Header navigation; the current page is ink with a 2px underline tick. */
export function NavLinks({ items }: { items: readonly { href: string; label: string }[] }) {
    const pathname = usePathname();
    return (
        <ul className="font-body flex items-center whitespace-nowrap text-[0.68rem] font-medium sm:gap-2 sm:text-[0.8rem]">
            {items.map((item) => {
                const current = pathname === item.href;
                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={current ? 'page' : undefined}
                            className={cn(
                                'relative inline-flex h-10 items-center rounded-md px-1.5 text-muted-foreground transition-colors hover:text-foreground sm:px-3',
                                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                                'after:absolute after:inset-x-1.5 after:-bottom-[0.55rem] after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 sm:after:inset-x-3',
                                current && 'text-foreground after:opacity-100',
                            )}
                        >
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
