import { ROUTES } from '../../../shared/config/site';
import { articleJsonLd, breadcrumbJsonLd } from '../../../shared/seo/json-ld';
import { JsonLd } from '../../../shared/ui/json-ld';
import { SiteShell } from '../../../shared/ui/site-shell';
import { TAG_ROWS } from '../model/tag-data';
import { Card } from '../../../../components/ui/card';
import { Note } from '../../../shared/ui/note';
import { Spot } from '../../../shared/ui/spot';
import { TextLink } from '../../../shared/ui/text-link';
import { SignExample } from './sign-example';
import { SignGallery } from './sign-gallery';

const h2 = 'font-heading mt-14 scroll-mt-6 text-[1.7rem] font-medium leading-tight tracking-[-0.01em] sm:text-[1.9rem]';

const GUIDE_PATH = '/guides/sign-formatting';
const GUIDE_UPDATED = ROUTES.find((route) => route.path === GUIDE_PATH)?.lastModified ?? '2026-10-02';
const GUIDE_DESCRIPTION =
    'Every tag a Valheim sign accepts, what it costs against the 50-character limit, and how color, underline and size tags behave in game.';

export function SignGuidePage() {
    return (
        <SiteShell>
            <JsonLd
                data={articleJsonLd({
                    headline: 'Valheim Sign Tag Guide',
                    description: GUIDE_DESCRIPTION,
                    path: GUIDE_PATH,
                    datePublished: '2026-10-02',
                    dateModified: GUIDE_UPDATED,
                })}
            />
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Sign tag guide', path: '/guides/sign-formatting' },
                ])}
            />

            <article className="mx-auto max-w-3xl font-heading text-[1.02rem] leading-[1.7] [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:text-brand-text [&_li]:marker:text-brand-text">
                <div className="flex items-end justify-between gap-6 border-b-2 border-foreground pb-5">
                    <div>
                        <h1 className="text-[2.6rem] leading-[1.02] font-normal tracking-[-0.025em] sm:text-[3.4rem]">
                            Valheim Sign Tag Guide
                        </h1>
                        <p className="font-body mt-3 text-[0.75rem] text-muted-foreground">
                            Last updated <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time>
                        </p>
                    </div>
                    <Spot name="signpost" className="-mb-3 hidden w-24 sm:block" />
                </div>
                <p className="mt-8 text-[1.2rem] leading-relaxed">
                    A Valheim sign holds 50 characters, and every character of a formatting tag counts towards that
                    limit. Yellow written as <code>&lt;#ff0&gt;</code> costs 6 characters; written as{' '}
                    <code>&lt;color=yellow&gt;</code> it costs 14, for exactly the same result.
                </p>
                <p className="mt-4 text-[1.2rem] leading-relaxed text-foreground/85">
                    Signs accept the same rich-text tags as Unity&apos;s TextMeshPro: color, size, spacing and more.
                    This guide lists the ones we have tested, what each costs and the quirks worth knowing. Prefer to
                    experiment? Open the{' '}
                    <TextLink href="/sign-editor">
                        Sign Editor
                    </TextLink>
                    .
                </p>
                <Card className="font-body mt-8 rounded-xl border-l-4 border-l-primary px-5 text-[0.8rem] leading-relaxed text-muted-foreground shadow-[var(--shadow-panel)]">
                    <p>
                    These notes come from building signs in the game and seeing what happened. They are not official
                    documentation, they may be incomplete, and a game patch can make them out of date. If a sign
                    behaves differently from what is written here, trust the sign.
                    </p>
                </Card>

                <h2 id="character-limit" className={h2}>
                    The 50-character budget
                </h2>
                <p className="mt-4">
                    Opening tags, closing tags and line breaks all count, and only the visible text is free. One
                    long tag can use up nearly a third of the sign before you have typed a word, so the main skill of
                    sign design is choosing the shortest tag that does the job.
                </p>
                <Note variant="cost">
                    <code>&lt;#f00&gt;</code> is 6 characters, <code>&lt;#ff0000&gt;</code> is 9 and{' '}
                    <code>&lt;color=red&gt;</code> is 11, for the same red.
                </Note>

                <SignExample number={1} markups={['<color=red>Troll path', '<#f00>Troll path']}>
                    The same red either way: 21 characters with the color name, 16 with the short hex code.
                </SignExample>

                <h2 id="tag-reference" className={h2}>
                    Tag reference
                </h2>
                <div
                    role="region"
                    aria-label="Sign tag reference table"
                    tabIndex={0}
                    className="font-body mt-5 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    <table className="w-full min-w-[40rem] border-collapse text-left text-[0.8rem]">
                        <caption className="sr-only">Each tag, what it does and how many characters it uses</caption>
                        <thead className="bg-secondary text-[0.7rem] tracking-[0.06em] text-muted-foreground uppercase">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    Tag
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    What it does
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Cost
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {TAG_ROWS.map((row) => (
                                <tr key={row.example} className="border-t border-border align-top">
                                    <th scope="row" className="px-4 py-3 font-normal">
                                        <code>{row.example}</code>
                                    </th>
                                    <td className="px-4 py-3">{row.effect}</td>
                                    <td className="px-4 py-3">{row.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 id="color" className={h2}>
                    Color and the order of tags
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-6">
                    <li>Text with no color tag is black.</li>
                    <li>
                        The 3-digit form works when both digits of every pair match: <code>&lt;#ff6600&gt;</code> becomes{' '}
                        <code>&lt;#f60&gt;</code>, but <code>&lt;#ff6a00&gt;</code> has no short form.
                    </li>
                    <li>
                        Underline and strikethrough take the color that is active when their tag opens.{' '}
                        <code>&lt;#f00&gt;&lt;u&gt;</code> gives a red line; <code>&lt;u&gt;&lt;#f00&gt;</code> gives red
                        text with a black line.
                    </li>
                    <li>
                        Closing tags are optional when the formatting should run to the end of the sign. Leaving out{' '}
                        <code>&lt;/smallcaps&gt;</code> saves twelve characters. Keep the closing tag if more text
                        follows, or the style carries on.
                    </li>
                </ul>
                <div className="my-6 grid gap-6 sm:grid-cols-3">
                    <Note variant="tip" className="my-0">
                        Use the 3-digit form when you can: <code>&lt;#ff66ff&gt;</code> becomes <code>&lt;#f6f&gt;</code>,
                        three characters cheaper.
                    </Note>
                    <Note variant="watch" className="my-0">
                        Open the color before <code>&lt;u&gt;</code> or <code>&lt;s&gt;</code>, or the line stays black.
                    </Note>
                    <Note variant="save" className="my-0">
                        Each closing tag you leave out saves at least four characters.
                    </Note>
                </div>

                <SignExample number={2} markups={['<#f00><u>Mead hall', '<u><#f00>Mead hall']}>
                    Color first and the line is red. Open <code>&lt;u&gt;</code> first and the text turns red, but
                    the line stays black.
                </SignExample>
                <SignExample number={3} markups={['<#f00>Copper</color> ore', '<#f00>Copper ore']}>
                    With <code>&lt;/color&gt;</code> only the first word is red. Leave it off and the color runs to
                    the end of the sign.
                </SignExample>

                <h2 id="size" className={h2}>
                    Size and automatic fitting
                </h2>
                <p className="mt-4">
                    Without a size tag the game fits text to the board. A single character lands near size 8 and every
                    extra character steps it down, so the same sentence is larger on one line than split over two. A{' '}
                    <code>&lt;size&gt;</code> tag skips this fitting. In our measurements, sizes 5, 7 and 9 drew at 14,
                    19 and 25 pixels on one sign. The board is the limit: size 14 is the largest capital that fits
                    inside it.
                </p>
                <Note variant="watch">
                    A capital at size 14 spans the board from top to bottom; at 15 it overhangs.
                </Note>

                <SignExample number={4} markups={['<size=5>5 <size=7>7 <size=9>9']}>
                    Sizes are absolute and linear: 9 is nine fifths the height of 5.
                </SignExample>

                <h2 id="letters" className={h2}>
                    Letters and fonts
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-6">
                    <li>
                        Signs use the Norsebold font, the only cut available, so bold text is already what you get.
                    </li>
                    <li>
                        Lowercase Latin letters are drawn with the capital glyphs, so &quot;hi there&quot; shows as
                        &quot;HI THERE&quot;. Use <code>&lt;smallcaps&gt;</code> if you want short capitals for lowercase
                        letters. Capitals are wider than lowercase, which affects how much fits on a line.
                    </li>
                    <li>
                        Beyond its own font, a sign falls back to the Noto fonts shipped with the game. In tests this
                        covered Chinese, Japanese, Korean, Thai, Hebrew, Arabic, Latin Extended and currency symbols. The
                        sparkle symbols U+2735 and U+2736 come out as empty boxes.
                    </li>
                    <li>
                        Elder Futhark runes draw correctly on the sign, but the in-game edit box has no font for them
                        and shows squares until you confirm. Paste them in and trust the sign.
                    </li>
                </ul>
                <Note variant="tip">
                    Skip <code>&lt;b&gt;</code>. It costs three characters and changes nothing.
                </Note>

                <SignExample number={5} markups={['Hi there', '<smallcaps>Hi there']}>
                    Lowercase letters are drawn as capitals. <code>&lt;smallcaps&gt;</code> makes them shorter
                    capitals, while letters typed as capitals keep full height.
                </SignExample>

                <h2 id="emoji" className={h2}>
                    Emoji
                </h2>
                <p className="mt-4">
                    Emoji come from a Noto Emoji font that the game ships, so they look the same for every player. They
                    are single-color and take whichever color tag is active. The font covers emoji up to Emoji 15.0
                    (2022); newer ones show as a box. Emoji built from several parts (skin tones, joined sequences,
                    flags) are not combined, so each part is drawn as its own symbol. For something more colorful, the
                    game also has 16 built-in sprite graphics, <code>&lt;sprite=0&gt;</code> to <code>&lt;sprite=15&gt;</code>.
                </p>
                <Note variant="watch">
                    Emoji newer than Emoji 15.0 (2022) show as a box.
                </Note>

                <SignExample number={6} markups={['<#00f>\u2693 Harbour']}>
                    Emoji are single-color, so they take whichever color tag is active.
                </SignExample>

                <h2 id="edit-box" className={h2}>
                    The edit box applies tags live
                </h2>
                <p className="mt-4">
                    While you type, the game&apos;s edit box already applies your tags instead of showing them as raw
                    text. Very small text, or text colored close to the plank, can look as if it vanished, although
                    usually part of it stays visible. What you see after confirming is the real result.
                </p>
                <Note variant="tip">
                    Not sure it worked? Confirm the sign and look at the board.
                </Note>

                <h2 id="six-signs" className={h2}>
                    Six signs worth stealing
                </h2>
                <p className="mt-4">
                    Each one fits within the 50-character limit. Copy the markup, paste it into a sign and change the
                    words to suit your base.
                </p>
                <SignGallery />

                <p className="mt-14 border-t border-border pt-6">
                    Ready to try it? Open the{' '}
                    <TextLink href="/sign-editor">
                        Sign Editor
                    </TextLink>
                    .
                </p>
            </article>
        </SiteShell>
    );
}
