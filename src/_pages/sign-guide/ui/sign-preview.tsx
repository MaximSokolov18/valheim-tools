'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { computeAutoFitFontSize } from '../../sign-editor/lib/auto-fit-font-size';
import { MIN_AUTO_FIT_SIZE, TEXT_AREA_WIDTH_RATIO } from '../../sign-editor/lib/font-size';
import { GAME_COLOR_MATRIX_VALUES } from '../../sign-editor/lib/game-color';
import { IMAGES } from '../../../shared/config/images';
import { parseSignMarkup, type SignLine, type SignRun } from '../lib/parse-sign-markup';

/*
 * Same stage as the editor's board (see sign-editor/ui/board.tsx): a 2:1 box at
 * its max-w-250 size (62.5rem = 1250px at the site's 20px root), and a text area
 * 90% x 80% with a 30px vertical inset. The preview is laid out at that size and scaled
 * down, so it wraps and fits exactly like the editor.
 */
const STAGE_W = 1250;
const STAGE_H = 625;

/** Norsebold capital height, as a fraction of the font size (735 / 1000 units). */
const CAP_HEIGHT = 0.735;
/** Pixels per `<size>` unit: the guide notes a capital at size 14 spans the board. */
const SIZE_UNIT = STAGE_H / (14 * CAP_HEIGHT);
/** Unsized text auto-fits, and the guide notes a single character lands near size 8. */
const AUTO_FIT_MAX = Math.round(8 * SIZE_UNIT);
/** The editor's floor too: what the game leaves unsized text at when sized text takes all the room. */
const AUTO_FIT_MIN = Math.round(MIN_AUTO_FIT_SIZE * SIZE_UNIT);
/** Norse's natural line height, which the game's sign text uses (the editor sets the same value). */
const EDITOR_LINE_HEIGHT = 1.1;
/** Longest the preview waits for the sign fonts before showing anyway. */
const FONT_WAIT_MS = 2500;

/**
 * Loads the sign fonts (Norse, and the monochrome Noto Emoji the game ships) for
 * exactly the characters on this sign. Both are fetched lazily per unicode range,
 * so without this the first paint shows fallback glyphs, such as color system emoji.
 */
function useSignFonts(text: string) {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let done = false;
        const finish = () => {
            if (!done) {
                done = true;
                setReady(true);
            }
        };
        const root = getComputedStyle(document.documentElement);
        const families = ['--font-norse', '--font-noto-emoji']
            .map((name) => root.getPropertyValue(name).trim())
            .filter(Boolean);
        const fonts = document.fonts;
        if (!fonts || !families.length) {
            finish();
            return;
        }
        Promise.all(families.map((family) => fonts.load(`1em ${family}`, text))).then(finish, finish);
        const timer = window.setTimeout(finish, FONT_WAIT_MS);
        return () => window.clearTimeout(timer);
    }, [text]);
    return ready;
}

/**
 * A line made only of sized text is as tall as its largest size, not the
 * auto-fitted size of the rest of the sign (which is what CSS would use).
 */
const lineFontSize = (line: SignLine) => {
    const sizes = line.runs.map((run) => run.style.size);
    return sizes.length && sizes.every((size) => size != null)
        ? `${Math.max(...(sizes as number[])) * SIZE_UNIT}px`
        : undefined;
};

/** Colors are written as typed; the editor's in-game color filter is applied over the whole text area. */
const signColor = (hex: string, opacity = 1) =>
    opacity >= 1 ? hex : `${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

/** Lowercase-typed letters become shorter capitals under <smallcaps>. */
function smallcaps(text: string): ReactNode[] {
    return text.split(/([a-zß-ÿ]+)/).map((part, i) =>
        i % 2 ? (
            <span key={i} style={{ fontSize: '0.8em' }}>
                {part.toUpperCase()}
            </span>
        ) : (
            part
        ),
    );
}

function Run({ run, indent }: { run: SignRun; indent: boolean }) {
    const { style } = run;
    const css: CSSProperties & Record<'--sign-mark', string | undefined> = {
        color: signColor(style.color, style.opacity),
        fontSize: style.size == null ? undefined : `${style.size * SIZE_UNIT}px`,
        fontStyle: style.italic ? 'italic' : undefined,
        // Same scale as <size>. Padding the line's first run by M inside a centered line shifts it by M / 2, like the game's margin.
        position: style.voffset ? 'relative' : undefined,
        top: style.voffset ? `${-style.voffset * SIZE_UNIT}px` : undefined,
        paddingLeft: indent && style.marginLeft ? `${style.marginLeft * SIZE_UNIT}px` : undefined,
        paddingRight: indent && style.marginRight ? `${style.marginRight * SIZE_UNIT}px` : undefined,
        // Read by the global `span[style*="--sign-mark"]` rule: a faint tint, like in game.
        '--sign-mark': style.mark ? style.mark.slice(0, 7) : undefined,
    };
    let content: ReactNode = style.smallcaps ? smallcaps(run.text) : run.text;
    if (style.script) {
        content = (
            <span style={{ fontSize: '0.6em', verticalAlign: style.script === 'sup' ? 'super' : 'sub' }}>{content}</span>
        );
    }
    // Each line keeps the color from when its tag opened, so they nest as separate spans.
    const line = (kind: 'underline' | 'line-through', color: string, inner: ReactNode) => (
        <span
            style={{
                textDecorationLine: kind,
                textDecorationColor: signColor(color),
                textDecorationThickness: '0.05em',
                textUnderlineOffset: '0.075em',
            }}
        >
            {inner}
        </span>
    );
    if (style.strike) content = line('line-through', style.strike, content);
    if (style.underline) content = line('underline', style.underline, content);
    return <span style={css}>{content}</span>;
}

/**
 * Read-only preview of sign markup, rendered like the editor's board: the same
 * stage, the same in-game color filter (emoji included) and auto-fit, plus the
 * guide's size measurements for `<size>`. Decorative: the markup itself is
 * always shown next to it as text.
 */
export function SignPreview({
    markup,
    board = 'oak',
    className,
}: {
    markup: string;
    /** `oak` keeps default black text readable; `editor` matches the sign editor's board. */
    board?: 'oak' | 'editor';
    className?: string;
}) {
    const lines = useMemo(() => parseSignMarkup(markup), [markup]);
    const frameRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);
    const fontsReady = useSignFonts(useMemo(() => lines.flatMap((l) => l.runs.map((r) => r.text)).join(''), [lines]));
    const filterId = `sign-preview-game-color-${useId().replace(/:/g, '')}`;

    useLayoutEffect(() => {
        const frame = frameRef.current;
        const area = areaRef.current;
        if (!frame || !area) return;
        const fit = () => {
            const search = () =>
                computeAutoFitFontSize({
                    min: AUTO_FIT_MIN,
                    max: AUTO_FIT_MAX,
                    fits: (px) => {
                        area.style.fontSize = `${px}px`;
                        return area.scrollWidth <= area.clientWidth && area.scrollHeight <= area.clientHeight;
                    },
                });
            // Same as the editor: lines break only at spaces, unless even the smallest unsized text leaves a
            // line too wide (big sized glyphs), where the game breaks it between characters.
            area.style.overflowWrap = 'normal';
            let size = search();
            area.style.fontSize = `${size}px`;
            if (area.scrollWidth > area.clientWidth) {
                area.style.overflowWrap = 'break-word';
                size = search();
            }
            area.style.fontSize = `${size}px`;
            // A line wider than the box overflows only to the right; center it on the sign like the game does.
            area.querySelectorAll('p').forEach((line) => {
                line.style.transform = '';
                const excess = line.scrollWidth - line.clientWidth;
                if (excess > 0) line.style.transform = `translateX(${-excess / 2}px)`;
            });
        };
        const measure = () => setScale(frame.clientWidth / STAGE_W);
        fit();
        measure();
        // The sign font loads lazily, possibly after this first fit, and its glyphs are
        // narrower than the fallback's, so fit again whenever a font finishes loading.
        const fonts = document.fonts;
        fonts?.ready.then(fit).catch(() => {});
        fonts?.addEventListener('loadingdone', fit);
        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        return () => {
            observer.disconnect();
            fonts?.removeEventListener('loadingdone', fit);
        };
    }, [lines, fontsReady]);

    return (
        <div ref={frameRef} aria-hidden="true" className={`relative aspect-2/1 w-full select-none ${className ?? ''}`}>
            <div
                className="absolute top-0 left-0 origin-top-left transition-opacity duration-300"
                style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, opacity: scale && fontsReady ? 1 : 0 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={board === 'editor' ? IMAGES.editorBoard : IMAGES.boards.oak}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_22px_26px_rgba(40,22,8,0.45)]"
                />
                <svg width="0" height="0" aria-hidden focusable="false" className="absolute">
                    <filter id={filterId} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values={GAME_COLOR_MATRIX_VALUES} />
                    </filter>
                </svg>
                <div
                    ref={areaRef}
                    className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col justify-center overflow-hidden text-center [font-family:var(--font-norse),var(--font-noto-emoji)]"
                    style={{
                        width: STAGE_W * TEXT_AREA_WIDTH_RATIO,
                        height: STAGE_H * 0.8,
                        padding: '30px 0',
                        fontSize: AUTO_FIT_MAX,
                        lineHeight: EDITOR_LINE_HEIGHT,
                        filter: `url(#${filterId})`,
                    }}
                >
                    {/* One full-width wrapper, like the editor's EditorContent, so auto-fit measures the same way. */}
                    <div className="w-full">
                        {lines.map((line, i) => (
                            <p
                                key={i}
                                className="m-0 [word-break:normal] whitespace-pre-wrap"
                                style={{ textAlign: line.align, fontSize: lineFontSize(line) }}
                            >
                                {line.runs.length ? line.runs.map((run, j) => (
                                    <Run key={j} run={run} indent={line.runs.findIndex((r) => r.style.marginLeft || r.style.marginRight) === j} />
                                )) : ' '}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
