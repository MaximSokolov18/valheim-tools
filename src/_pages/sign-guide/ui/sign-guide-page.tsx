import Link from 'next/link';
import { ROUTES } from '../../../shared/config/site';
import { articleJsonLd, breadcrumbJsonLd } from '../../../shared/seo/json-ld';
import { JsonLd } from '../../../shared/ui/json-ld';
import { SiteShell } from '../../../shared/ui/site-shell';
import { TAG_ROWS } from '../model/tag-data';

const h2 = 'font-heading mt-10 text-3xl';

const GUIDE_PATH = '/guides/sign-formatting';
const GUIDE_UPDATED = ROUTES.find((route) => route.path === GUIDE_PATH)?.lastModified ?? '2026-10-02';
const GUIDE_DESCRIPTION =
    'Every tag a Valheim sign accepts, what it costs against the 50-character limit, and how colour, underline and size tags behave in game.';

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

            <article className="max-w-3xl">
                <h1 className="font-heading text-4xl sm:text-5xl">Valheim Sign Tag Guide</h1>
                <p className="mt-2 text-sm">
                    Last updated <time dateTime={GUIDE_UPDATED}>{GUIDE_UPDATED}</time>
                </p>
                <p className="mt-4 text-lg">
                    A Valheim sign holds 50 characters, and every character of a formatting tag counts towards that
                    limit. Colour tags such as <code>&lt;#ff0&gt;</code> (6 characters) are far cheaper than{' '}
                    <code>&lt;color=yellow&gt;</code> (14) and look identical.
                </p>
                <p className="mt-4 text-lg">
                    Signs in Valheim understand rich-text tags for colour, size, spacing and more. This guide lists the
                    tags we have tested, what each one costs and the quirks worth knowing. Prefer to experiment? Open
                    the{' '}
                    <Link href="/sign-editor" className="underline underline-offset-4">
                        Sign Editor
                    </Link>
                    .
                </p>
                <p className="mt-4 rounded-md border border-border bg-card p-4">
                    These notes come from building signs in the game and watching what happened. They are not official
                    documentation, they may be incomplete and a game patch can make them out of date. If a sign behaves
                    differently from what is written here, trust the sign.
                </p>

                <h2 id="character-limit" className={h2}>
                    The 50-character budget
                </h2>
                <p className="mt-3">
                    A sign holds 50 characters, and every character of every tag counts towards that total.{' '}
                    <code>&lt;color=yellow&gt;</code> uses 14 characters, while <code>&lt;#ff0&gt;</code> uses 6 and
                    looks identical. Choosing the shortest tag that does the job is the main skill of sign design.
                </p>

                <h2 id="tag-reference" className={h2}>
                    Tag reference
                </h2>
                <div
                    role="region"
                    aria-label="Sign tag reference table"
                    tabIndex={0}
                    className="mt-3 overflow-x-auto rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    <table className="w-full min-w-[40rem] border-collapse text-left">
                        <caption className="sr-only">Each tag, what it does and how many characters it uses</caption>
                        <thead className="bg-secondary text-secondary-foreground">
                            <tr>
                                <th scope="col" className="px-3 py-2">
                                    Tag
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    What it does
                                </th>
                                <th scope="col" className="px-3 py-2">
                                    Cost
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {TAG_ROWS.map((row) => (
                                <tr key={row.example} className="border-t border-border align-top">
                                    <th scope="row" className="px-3 py-2 font-normal">
                                        <code>{row.example}</code>
                                    </th>
                                    <td className="px-3 py-2">{row.effect}</td>
                                    <td className="px-3 py-2">{row.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 id="colour" className={h2}>
                    Colour and the order of tags
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Text with no colour tag is black.</li>
                    <li>
                        Where both digits of a hex pair match, you can drop one: <code>&lt;#ff66ff&gt;</code> becomes{' '}
                        <code>&lt;#f6f&gt;</code>.
                    </li>
                    <li>
                        Underline and strikethrough take the colour that is active when their tag opens.{' '}
                        <code>&lt;#f00&gt;&lt;u&gt;</code> gives a red line; <code>&lt;u&gt;&lt;#f00&gt;</code> gives red
                        text with a black line.
                    </li>
                    <li>
                        Closing tags are optional when the formatting should run to the end of the sign. Each one you
                        leave out saves at least four characters, and <code>&lt;/smallcaps&gt;</code> saves twelve. Keep
                        the closing tag if more text follows it, or the style carries on.
                    </li>
                </ul>

                <h2 id="size" className={h2}>
                    Size and automatic fitting
                </h2>
                <p className="mt-3">
                    Without a size tag the game fits text to the board. A single character lands near size 8 and every
                    extra character steps it down, so the same sentence is larger on one line than split over two. A{' '}
                    <code>&lt;size&gt;</code> tag is not affected by this fitting. In our measurements sizes 5, 7 and 9
                    drew at 14, 19 and 25 pixels on one sign. A capital letter at size 14 spans the board from top to
                    bottom, and at 15 it overhangs it.
                </p>

                <h2 id="letters" className={h2}>
                    Letters and fonts
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>
                        Signs use the Norsebold font, the only cut available, so <code>&lt;b&gt;</code> changes nothing.
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

                <h2 id="emoji" className={h2}>
                    Emoji
                </h2>
                <p className="mt-3">
                    Emoji come from a Noto Emoji font that the game ships, so they look the same for every player. They
                    are single-colour and take whichever colour tag is active. The font covers emoji up to Emoji 15.0
                    (2022); newer ones show as a box. Emoji built from several parts (skin tones, joined sequences,
                    flags) are not combined, and each part is drawn as its own symbol. There are also 16 built-in sprite
                    graphics, <code>&lt;sprite=0&gt;</code> to <code>&lt;sprite=15&gt;</code>.
                </p>

                <h2 id="edit-box" className={h2}>
                    The edit box applies tags live
                </h2>
                <p className="mt-3">
                    While you type, the game&apos;s edit box already applies your tags instead of showing them as raw
                    text. Text that is very small or coloured close to the plank can look as if it vanished, though
                    usually part of it stays visible. Confirm the sign to see the finished result.
                </p>

                <p className="mt-10">
                    Ready to try it? Open the{' '}
                    <Link href="/sign-editor" className="underline underline-offset-4">
                        Sign Editor
                    </Link>
                    .
                </p>
            </article>
        </SiteShell>
    );
}
