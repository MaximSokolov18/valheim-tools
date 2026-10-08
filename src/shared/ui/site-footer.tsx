import Link from 'next/link';
import { SITE } from '../config/site';
import { PrivacySettingsButton } from './privacy-settings-button';

const footerLink =
    'underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm';

export function SiteFooter() {
    return (
        <footer className="font-body mt-16 border-t border-border bg-card/60 text-[0.75rem] text-muted-foreground">
            <div className="mx-auto grid max-w-5xl gap-x-12 gap-y-4 px-4 py-10 sm:px-6 md:grid-cols-[auto_auto_1fr] md:items-start">
                <nav aria-label="Site">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-foreground">
                        <li>
                            <Link href="/" className="underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/sign-editor" className="underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm">
                                Sign Editor
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/sign-formatting" className="underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm">
                                Sign Tag Guide
                            </Link>
                        </li>
                    </ul>
                </nav>
                <nav aria-label="Legal">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-foreground">
                        <li>
                            <Link href="/privacy" className="underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms" className="underline-offset-4 decoration-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm">
                                Terms of Use
                            </Link>
                        </li>
                        <PrivacySettingsButton className={`cursor-pointer font-medium ${footerLink}`} />
                    </ul>
                </nav>
                <p className="max-w-xl md:col-span-3 md:border-t md:border-border md:pt-4">
                    Found a bug or something not working? Please report it to{' '}
                    <a
                        href={`mailto:${SITE.operator.contactEmail}`}
                        className="font-medium text-foreground underline underline-offset-4 decoration-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                    >
                        {SITE.operator.contactEmail}
                    </a>{' '}
                    and it will be fixed as soon as possible.
                </p>
                <p className="max-w-xl md:col-span-3">{SITE.disclaimer}</p>
                <p className="md:col-span-3">
                    &copy; {SITE.copyrightYear} {SITE.name}
                </p>
            </div>
        </footer>
    );
}
