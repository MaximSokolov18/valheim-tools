/**
 * Parses Valheim sign markup into lines of styled runs for the guide's
 * read-only sign previews. It follows the behaviour documented in the guide
 * (see ../model/tag-data.ts): colors, sizes, the on/off styles, highlights,
 * alignment and the escaped line breaks. Tags it does not model are shown as
 * literal text, which is also what the game does with tags it does not know.
 */

export type SignAlign = 'left' | 'center' | 'right';

export interface SignRunStyle {
    /** `#rrggbb` as typed (before the in-game color shift). */
    color: string;
    /** 0-1, from the optional opacity digits of a hex color. */
    opacity: number;
    /** `<size=N>` in sign units, or null for auto-fitted text. */
    size: number | null;
    italic: boolean;
    /** Underline/strikethrough take the color active when their tag opened. */
    underline: string | null;
    strike: string | null;
    /** `<mark=#rrggbb>` / `#rrggbbaa`; shorter codes are ignored, as in game. */
    mark: string | null;
    script: 'sub' | 'sup' | null;
    smallcaps: boolean;
}

export interface SignRun {
    text: string;
    style: SignRunStyle;
}

export interface SignLine {
    align: SignAlign;
    runs: SignRun[];
}

export const DEFAULT_SIGN_COLOR = '#000000';

/** Color names the previews understand for `<color=name>`. */
const NAMED_COLORS: Record<string, string> = {
    black: '#000000',
    blue: '#0000ff',
    green: '#008000',
    orange: '#ffa500',
    purple: '#a020f0',
    red: '#ff0000',
    white: '#ffffff',
    yellow: '#ffff00',
};

const TAG = /^<(\/?)([a-z-]+|#[0-9a-f]+)(?:=("?)([^>"]*)\3)?>/i;
const LINE_BREAKS = new Set(['\\n', '\\v']);

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` to `{ hex: '#rrggbb', opacity }`, else null. */
export function parseHexColor(value: string): { hex: string; opacity: number } | null {
    const m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
    if (!m) return null;
    let digits = m[1].toLowerCase();
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join('');
    const opacity = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
    return { hex: `#${digits.slice(0, 6)}`, opacity };
}

export function parseSignMarkup(markup: string): SignLine[] {
    const colors: { hex: string; opacity: number }[] = [];
    const sizes: number[] = [];
    let italic = false;
    let underline: string | null = null;
    let strike: string | null = null;
    let mark: string | null = null;
    let script: SignRunStyle['script'] = null;
    let smallcaps = false;
    let align: SignAlign = 'center';

    const lines: SignLine[] = [{ align, runs: [] }];
    const current = () => lines[lines.length - 1];
    const activeColor = () => colors[colors.length - 1] ?? { hex: DEFAULT_SIGN_COLOR, opacity: 1 };
    const push = (text: string) => {
        const color = activeColor();
        const style: SignRunStyle = {
            color: color.hex,
            opacity: color.opacity,
            size: sizes[sizes.length - 1] ?? null,
            italic,
            underline,
            strike,
            mark,
            script,
            smallcaps,
        };
        const runs = current().runs;
        const last = runs[runs.length - 1];
        if (last && JSON.stringify(last.style) === JSON.stringify(style)) last.text += text;
        else runs.push({ text, style });
    };

    let i = 0;
    while (i < markup.length) {
        const two = markup.slice(i, i + 2);
        if (LINE_BREAKS.has(two)) {
            lines.push({ align, runs: [] });
            i += 2;
            continue;
        }
        if (two === '\\t') {
            push('\t');
            i += 2;
            continue;
        }
        const m = markup[i] === '<' ? TAG.exec(markup.slice(i)) : null;
        if (m && applyTag(m[1] === '/', m[2].toLowerCase(), m[4])) {
            i += m[0].length;
            continue;
        }
        push(markup[i]);
        i += 1;
    }
    return lines;

    /** Returns false for tags the previews do not model, so they render literally. */
    function applyTag(closing: boolean, name: string, value: string | undefined): boolean {
        if (name.startsWith('#')) {
            const color = parseHexColor(name);
            if (!color || closing) return false;
            colors.push(color);
            return true;
        }
        switch (name) {
            case 'color': {
                if (closing) {
                    colors.pop();
                    return true;
                }
                const named = NAMED_COLORS[(value ?? '').toLowerCase()];
                const color = parseHexColor(value ?? '') ?? (named ? { hex: named, opacity: 1 } : null);
                if (!color) return false;
                colors.push(color);
                return true;
            }
            case 'size': {
                if (closing) {
                    sizes.pop();
                    return true;
                }
                const n = Number(value);
                if (!Number.isFinite(n) || n <= 0) return false;
                sizes.push(n);
                return true;
            }
            case 'b':
                // Signs only have Norsebold, so <b> changes nothing.
                return true;
            case 'i':
                italic = !closing;
                return true;
            case 'u':
                underline = closing ? null : activeColor().hex;
                return true;
            case 's':
                strike = closing ? null : activeColor().hex;
                return true;
            case 'sub':
            case 'sup':
                script = closing ? null : name;
                return true;
            case 'smallcaps':
                smallcaps = !closing;
                return true;
            case 'mark': {
                if (closing) {
                    mark = null;
                    return true;
                }
                const v = value ?? '';
                // The game needs the full 6- or 8-digit hex; shorter codes are ignored.
                mark = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ? v.toLowerCase() : null;
                return true;
            }
            case 'align': {
                const a = closing ? 'center' : value?.toLowerCase();
                if (a !== 'left' && a !== 'center' && a !== 'right') return false;
                align = a;
                if (current().runs.length === 0) current().align = a;
                return true;
            }
            default:
                return false;
        }
    }
}
