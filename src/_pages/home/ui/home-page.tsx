import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';
import { IMAGES } from '../../../shared/config/images';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Spot, type SpotName } from '../../../shared/ui/spot';
import { TextLink } from '../../../shared/ui/text-link';
import { websiteJsonLd } from '../../../shared/seo/json-ld';
import { JsonLd } from '../../../shared/ui/json-ld';
import { SiteShell } from '../../../shared/ui/site-shell';
import { FjordScene } from './fjord-scene';

// Kit button styles on links, so the CTAs keep their link role. Mead gold marks the one primary action.
const ctaSize = 'h-11 rounded-xl px-5 text-[0.8rem] font-semibold';
const primaryButton = cn(buttonVariants({ size: 'lg' }), ctaSize, 'shadow-sm hover:bg-primary/90');
const secondaryButton = cn(buttonVariants({ variant: 'outline', size: 'lg' }), ctaSize, 'border-input/60 bg-background/70 backdrop-blur-sm');
const sectionTitle = 'font-heading text-[1.9rem] font-normal leading-tight tracking-[-0.015em] sm:text-[2.2rem]';

function SectionHeading({ id, spot, children }: { id: string; spot: SpotName; children: ReactNode }) {
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
        text: 'A Valheim sign holds just 50 characters, and every formatting tag eats into that. The editor keeps count as you type, so you find out about a sign that is too long before you are standing in front of it.',
    },
    {
        title: 'Runs in your browser',
        text: 'No account and nothing to install. The text you write stays on your device.',
    },
    {
        title: 'Free, with no ads',
        text: 'Open a tool and start. No sign-up, no ads, no tracking.',
    },
] as const;

const STEPS = [
    {
        title: 'Write and style',
        text: 'Type your text, then add colors and emoji from the toolbar.',
    },
    {
        title: 'Check that it fits',
        text: 'Tags count towards the 50-character limit. The editor shows your running total.',
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
        answer: 'No. The tools are free, and there are no ads.',
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
                <TextLink href="/privacy">
                    privacy policy
                </TextLink>{' '}
                for details.
            </>
        ),
    },
    {
        question: 'Why does my lowercase text look like capitals?',
        answer: (
            <>
                Valheim&apos;s sign font draws lowercase letters as capitals, so &quot;hi there&quot; shows as
                &quot;HI THERE&quot;. The{' '}
                <TextLink href="/guides/sign-formatting#letters">
                    sign tag guide
                </TextLink>{' '}
                covers this and the other font quirks.
            </>
        ),
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
                            Free browser tools for Valheim players. Design sign text with colors and emoji, then copy
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
                    <li className="group flex">
                        <Card className="w-full gap-0 rounded-2xl py-0 text-base shadow-[var(--shadow-panel)]">
                        <div className="relative flex aspect-[2.4/1] items-center justify-center overflow-hidden bg-stage">
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-[url('/images/scene/fjord-day.webp')] bg-cover bg-center opacity-55 dark:bg-[url('/images/scene/fjord-night.webp')]"
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={IMAGES.boards.oak}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="relative w-[62%] drop-shadow-[0_14px_18px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-1"
                            />
                        </div>
                        <CardContent className="flex flex-1 flex-col p-6">
                            <h3 className="font-heading text-[1.4rem] font-medium">Sign Editor</h3>
                            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                                Pick colors and emoji, stay within the character limit and copy the finished
                                sign text.
                            </p>
                            <Link
                                href="/sign-editor"
                                className="mt-4 inline-flex items-center gap-1 self-start text-[0.8rem] font-semibold text-brand-text underline decoration-brand-text/40 underline-offset-4 hover:decoration-brand-text"
                            >
                                Open the Sign Editor
                            </Link>
                        </CardContent>
                        </Card>
                    </li>
                    <li className="flex">
                        <Card className="w-full items-start justify-end gap-2 rounded-2xl border border-dashed border-input/50 bg-transparent p-6 text-base ring-0">
                            <Spot name="chest" className="mb-auto w-32 opacity-90" />
                            <h3 className="font-heading text-[1.4rem] font-medium">More tools</h3>
                            <p className="text-[0.85rem] leading-relaxed text-muted-foreground">The Sign Editor is the first tool. More are on the way.</p>
                        </Card>
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
                        <li key={step.title} className="flex">
                            <Card className="w-full gap-2 rounded-2xl p-6 text-base shadow-[var(--shadow-panel)]">
                                <h3 className="font-heading text-[1.25rem] font-medium">
                                    <span className="text-brand-text">{index + 1}.</span> {step.title}
                                </h3>
                                <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{step.text}</p>
                            </Card>
                        </li>
                    ))}
                </ol>
                <p className="mt-6 text-[0.85rem]">
                    Want to know what each tag does? The{' '}
                    <TextLink href="/guides/sign-formatting">
                        sign tag guide
                    </TextLink>{' '}
                    lists every one with its character cost.
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
