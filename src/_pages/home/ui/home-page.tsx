import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '../../../shared/lib';
import { websiteJsonLd } from '../../../shared/seo/json-ld';
import { JsonLd } from '../../../shared/ui/json-ld';
import { SiteShell } from '../../../shared/ui/site-shell';

const buttonBase = cn(
    'inline-flex items-center rounded-md px-5 py-3 text-lg transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
);
// Same control tokens as the editor's buttons (see copy-sign-panel), so the two feel like one product.
const primaryButton = cn(buttonBase, 'bg-primary text-primary-foreground hover:bg-primary/90');
const secondaryButton = cn(buttonBase, 'bg-control text-control-foreground hover:bg-control-hover');

const FEATURES = [
    {
        title: 'Made for sign text',
        text: 'Signs have a tight character budget and their own quirks. The editor is built around them, so you can focus on how the sign looks.',
    },
    {
        title: 'Runs in your browser',
        text: 'No account and nothing to install. The text you write stays on your device.',
    },
    {
        title: 'Free to use',
        text: 'The tools are free for everyone. Start designing as soon as the page loads.',
    },
] as const;

const STEPS = [
    {
        title: 'Write and style',
        text: 'Type your text, then pick colours, sizes and emoji from the toolbar.',
    },
    {
        title: 'Check that it fits',
        text: 'Formatting tags count towards the sign limit of 50 characters, so keep an eye on the total.',
    },
    {
        title: 'Copy it into the game',
        text: 'Copy the finished text and paste it into a sign in Valheim.',
    },
] as const;

type FaqItem = { readonly question: string; readonly answer: ReactNode };

const FAQ: readonly FaqItem[] = [
    {
        question: 'Is Viking Tools official?',
        answer: 'No. It is an unofficial fan-made project and is not affiliated with, endorsed by or sponsored by the game\'s developer or publisher.',
    },
    {
        question: 'Does it cost anything?',
        answer: 'No, the tools are free to use.',
    },
    {
        question: 'Do I need an account?',
        answer: 'No. Open a tool and start using it.',
    },
    {
        question: 'Is my sign text uploaded anywhere?',
        answer: (
            <>
                No. The editor works in your browser and your text is not sent to us. See the{' '}
                <Link href="/privacy" className="underline underline-offset-4">
                    privacy policy
                </Link>{' '}
                for details.
            </>
        ),
    },
    {
        question: 'Why does my lowercase text look like capitals?',
        answer: 'The in-game sign font draws lowercase letters as capitals. The sign tag guide explains this and other font quirks.',
    },
];

export function HomePage() {
    return (
        <SiteShell>
            <JsonLd data={websiteJsonLd()} />

            <section aria-labelledby="hero-title" className="flex flex-col items-start gap-6 py-6">
                <h1 id="hero-title" className="font-heading text-5xl sm:text-6xl">
                    Viking Tools
                </h1>
                <p className="max-w-2xl text-xl">
                    Free browser tools for Valheim players. Design sign text with colours, sizes and emoji, then copy
                    it into the game.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/sign-editor" className={primaryButton}>
                        Open the Sign Editor
                    </Link>
                    <Link href="/guides/sign-formatting" className={secondaryButton}>
                        Read the sign tag guide
                    </Link>
                </div>
            </section>

            <section aria-labelledby="tools-title" className="mt-12">
                <h2 id="tools-title" className="font-heading text-3xl">
                    Tools
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    <li className="rounded-lg border border-border bg-card p-5 text-card-foreground">
                        <h3 className="text-xl font-semibold">Sign Editor</h3>
                        <p className="mt-2">
                            Pick colours, sizes and emoji, stay within the character limit and copy the finished
                            sign text.
                        </p>
                        <Link href="/sign-editor" className="mt-3 inline-block underline underline-offset-4">
                            Open the Sign Editor
                        </Link>
                    </li>
                    <li className="rounded-lg border border-dashed border-border p-5">
                        <h3 className="text-xl font-semibold">More tools</h3>
                        <p className="mt-2">More tools are planned. Check back soon.</p>
                    </li>
                </ul>
            </section>

            <section aria-labelledby="why-title" className="mt-12">
                <h2 id="why-title" className="font-heading text-3xl">
                    Why Viking Tools
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                    {FEATURES.map((feature) => (
                        <li key={feature.title}>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="mt-2">{feature.text}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="how-title" className="mt-12">
                <h2 id="how-title" className="font-heading text-3xl">
                    How it works
                </h2>
                <ol className="mt-4 grid gap-4 sm:grid-cols-3">
                    {STEPS.map((step, index) => (
                        <li key={step.title}>
                            <h3 className="text-xl font-semibold">
                                {index + 1}. {step.title}
                            </h3>
                            <p className="mt-2">{step.text}</p>
                        </li>
                    ))}
                </ol>
                <p className="mt-4">
                    Want to go deeper? The{' '}
                    <Link href="/guides/sign-formatting" className="underline underline-offset-4">
                        sign tag guide
                    </Link>{' '}
                    lists every tag and what it costs.
                </p>
            </section>

            <section aria-labelledby="faq-title" className="mt-12">
                <h2 id="faq-title" className="font-heading text-3xl">
                    Questions
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                    {FAQ.map((item) => (
                        <div key={item.question}>
                            <h3 className="text-xl font-semibold">{item.question}</h3>
                            <p className="mt-1">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </SiteShell>
    );
}
