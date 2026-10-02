import Link from 'next/link';
import { SITE } from '../config/site';

export function SiteFooter() {
    return (
        <footer className="font-body border-t border-border bg-card text-base text-muted-foreground">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8">
                <nav aria-label="Site">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        <li>
                            <Link href="/" className="underline-offset-4 hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/sign-editor" className="underline-offset-4 hover:underline">
                                Sign Editor
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/sign-formatting" className="underline-offset-4 hover:underline">
                                Sign Tag Guide
                            </Link>
                        </li>
                    </ul>
                </nav>
                <nav aria-label="Legal">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        <li>
                            <Link href="/privacy" className="underline-offset-4 hover:underline">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms" className="underline-offset-4 hover:underline">
                                Terms of Use
                            </Link>
                        </li>
                    </ul>
                </nav>
                <p>{SITE.disclaimer}</p>
                <p>
                    &copy; {new Date().getFullYear()} {SITE.name}
                </p>
            </div>
        </footer>
    );
}
