import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '../../../shared/lib';
import { websiteJsonLd } from '../../../shared/seo/json-ld';
import { JsonLd } from '../../../shared/ui/json-ld';
import { SiteShell } from '../../../shared/ui/site-shell';
import { FjordScene } from './fjord-scene';

const buttonBase = cn(
    'font-body inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[0.8rem] font-semibold transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
);
// Mead gold marks the one primary action; the secondary sits on paper with an ink edge.
const primaryButton = cn(buttonBase, 'bg-primary text-primary-foreground shadow-sm hover:brightness-95');
const secondaryButton = cn(
    buttonBase,
    'border border-input/60 bg-background/70 text-foreground backdrop-blur-sm hover:bg-control',
);
const inlineLink = 'underline decoration-foreground/35 underline-offset-4 transition-colors hover:decoration-foreground';
const sectionTitle = 'font-heading text-[1.9rem] font-normal leading-tight tracking-[-0.015em] sm:text-[2.2rem]';

/** Small painted spot drawing beside a section heading. Decorative. */
function Spot({ name, className }: { name: 'hammer' | 'chest' | 'portal' | 'signpost'; className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`/images/spots/${name}.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={cn('pointer-events-none h-auto shrink-0 select-none mix-blend-multiply dark:mix-blend-normal dark:opacity-90', className)}
        />
    );
}

function SectionHeading({ id, spot, children }: { id: string; spot: Parameters<typeof Spot>[0]['name']; children: ReactNode }) {
    return (
        <div className="flex items-end justify-between gap-6 border-b border-foreground/80 pb-3">
            <h2 id={id} className={sectionTitle}>
                {children}
            </h2>
            <Spot name={spot} className="-mb-2 w-16 sm:w-20" />
        </div>
    );
}

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
        text: 'Type your text, then pick colours and emoji from the toolbar.',
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
                <Link href="/privacy" className={inlineLink}>
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

            {/* Full-bleed hero over the painted fjord; on narrow screens the scene is a band below the copy. */}
            <section
                aria-labelledby="hero-title"
                className="relative isolate -mt-12 mx-[calc(50%-50vw)] flex flex-col md:h-[calc(100svh-3.5rem)] md:max-h-[52rem] md:min-h-[36rem]"
            >
                <FjordScene
                    className="relative order-2 h-[340px] w-full md:absolute md:inset-0 md:order-none md:h-auto"
                    shipX={0.72}
                    shipW={0.26}
                    waterline={0.2}
                    horizon={0.3}
                    wash={0.4}
                />
                <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-center px-4 pt-14 pb-8 sm:px-6 md:h-full md:py-16">
                    <div className="flex max-w-[30rem] flex-col items-start gap-6 md:max-w-[25rem] xl:max-w-[30rem]">
                        <h1
                            id="hero-title"
                            className="font-heading text-[3rem] leading-[0.98] font-normal tracking-[-0.03em] sm:text-[3.8rem]"
                        >
                            Viking Tools
                        </h1>
                        <p className="font-heading text-[1.1rem] leading-relaxed text-foreground/85 sm:text-[1.2rem]">
                            Free browser tools for Valheim players. Design sign text with colours and emoji, then copy
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
                    </div>
                </div>
            </section>

            <section aria-labelledby="tools-title" className="mt-16 md:mt-24">
                <SectionHeading id="tools-title" spot="hammer">
                    Tools
                </SectionHeading>
                <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[var(--shadow-panel)]">
                        <div className="relative flex aspect-[2.4/1] items-center justify-center overflow-hidden bg-stage">
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-[url('/images/scene/fjord-day.webp')] bg-cover bg-center opacity-55 dark:bg-[url('/images/scene/fjord-night.webp')]"
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/boards/board-oak.webp"
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="relative w-[62%] drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-1"
                            />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                            <h3 className="font-heading text-[1.4rem] font-medium">Sign Editor</h3>
                            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                                Pick colours and emoji, stay within the character limit and copy the finished
                                sign text.
                            </p>
                            <Link
                                href="/sign-editor"
                                className="mt-4 inline-flex items-center gap-1 self-start text-[0.8rem] font-semibold text-brand-text underline decoration-brand-text/40 underline-offset-4 hover:decoration-brand-text"
                            >
                                Open the Sign Editor
                            </Link>
                        </div>
                    </li>
                    <li className="flex flex-col items-start justify-end gap-2 rounded-2xl border border-dashed border-input/50 p-6">
                        <Spot name="chest" className="mb-auto w-32 opacity-90" />
                        <h3 className="font-heading text-[1.4rem] font-medium">More tools</h3>
                        <p className="text-[0.85rem] leading-relaxed text-muted-foreground">More tools are planned. Check back soon.</p>
                    </li>
                </ul>
            </section>

            <section aria-labelledby="why-title" className="mt-20 md:mt-28">
                <SectionHeading id="why-title" spot="portal">
                    Why Viking Tools
                </SectionHeading>
                <ul className="mt-8 grid gap-8 sm:grid-cols-3">
                    {FEATURES.map((feature) => (
                        <li key={feature.title} className="border-t-2 border-foreground pt-4">
                            <h3 className="font-heading text-[1.25rem] font-medium">{feature.title}</h3>
                            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">{feature.text}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="how-title" className="mt-20 md:mt-28">
                <SectionHeading id="how-title" spot="signpost">
                    How it works
                </SectionHeading>
                <ol className="mt-8 grid gap-5 sm:grid-cols-3">
                    {STEPS.map((step, index) => (
                        <li key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-panel)]">
                            <h3 className="font-heading text-[1.25rem] font-medium">
                                <span className="text-brand-text">{index + 1}.</span> {step.title}
                            </h3>
                            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">{step.text}</p>
                        </li>
                    ))}
                </ol>
                <p className="mt-6 text-[0.85rem]">
                    Want to go deeper? The{' '}
                    <Link href="/guides/sign-formatting" className={inlineLink}>
                        sign tag guide
                    </Link>{' '}
                    lists every tag and what it costs.
                </p>
            </section>

            <section aria-labelledby="faq-title" className="mt-20 md:mt-28">
                <SectionHeading id="faq-title" spot="chest">
                    Questions
                </SectionHeading>
                <div className="mt-2 flex flex-col divide-y divide-border">
                    {FAQ.map((item) => (
                        <div key={item.question} className="grid gap-2 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
                            <h3 className="font-heading text-[1.2rem] font-medium leading-snug">{item.question}</h3>
                            <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </SiteShell>
    );
}
