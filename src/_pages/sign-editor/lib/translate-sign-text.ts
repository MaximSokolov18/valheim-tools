import type { Editor, JSONContent } from '@tiptap/core';
import { parseFontSize } from './font-size';
import { parseOffset } from './text-offset';
import { DEFAULT_TEXT_COLOR, normalizeHexColor, shortenHexColor } from './text-color';

/** Valheim's in-game sign text box caps input at 50 characters, tags included. */
export const SIGN_CHAR_LIMIT = 50;

/**
 * The two literal characters Valheim's sign renderer turns into a line break
 * when pasted (`\n`, backslash + n) — not an actual line-feed, and two
 * characters cheaper than `<br>`. See the Valheim wiki's sign-styling rules.
 */
const SIGN_NEWLINE = '\\n';

type Script = 'sub' | 'sup';

interface RunStyle {
    color: string | null;
    highlight: string | null;
    size: number | null;
    voffset: number | null;
    margin: number | null;
    marginRight: number | null;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    script: Script | null;
}

const resolveRunStyle = (marks: JSONContent['marks']): RunStyle => {
    const textStyle = marks?.find((mark) => mark.type === 'textStyle');
    const has = (type: string) => marks?.some((mark) => mark.type === type) ?? false;
    return {
        color: normalizeHexColor(String(textStyle?.attrs?.color ?? '')),
        highlight: normalizeHexColor(String(textStyle?.attrs?.backgroundColor ?? '')),
        size: parseFontSize(textStyle?.attrs?.fontSize as string | null | undefined),
        voffset: parseOffset('verticalOffset', textStyle?.attrs?.verticalOffset as string | null | undefined),
        margin: parseOffset('marginLeft', textStyle?.attrs?.marginLeft as string | null | undefined),
        marginRight: parseOffset('marginRight', textStyle?.attrs?.marginRight as string | null | undefined),
        italic: has('italic'),
        underline: has('underline'),
        strike: has('strike'),
        script: has('subscript') ? 'sub' : has('superscript') ? 'sup' : null,
    };
};

/** State carried from one line of the sign to the next. */
interface SignState {
    /** The color in effect: the game's default until a color tag changes it. */
    color: string;
}

/**
 * Emits the minimal Unity Rich Text markup for one paragraph's inline nodes.
 *
 * Color is never closed: a color tag stays in effect, across line breaks too,
 * until the next color tag replaces it, so `<#ff0>Hello<#fff>World` needs no
 * `</color>`. Text without an explicit color gets the default color back with
 * `<#000>` (6 characters) instead of `</color>` (8 characters for each color
 * still open). A run whose color is already in effect emits no tag at all,
 * and neither does whitespace with no underline or strikethrough: a space shows
 * no color, so it keeps whatever color is in effect, and the next visible
 * character opens its own (`<#0ff>hello <#f0f>world`).
 *
 * `<size>` stays in effect until explicitly closed, so an already-open size
 * never needs closing just to switch to a *different* value. Closing tags are
 * only emitted where the following content has no size of its own, and as
 * many `</size>` as remain open.
 *
 * `<mark=#rrggbb>` is always written as a full 6-digit hex (the game ignores
 * shorter codes) and is closed and reopened whenever the highlight changes.
 *
 * `<i>`, `<u>`, `<s>`, `<sub>` and `<sup>` are on/off tags: opened when a run
 * needs them and not already open, closed as soon as a run no longer does.
 * Underline and strikethrough take the color that was active when their tag
 * opened, so they are always opened after `<color>`, and are closed and
 * reopened whenever the color changes underneath them.
 *
 * `suppressTrailingClose` skips the flush that would otherwise follow the
 * paragraph's last styled run: Valheim's parser closes any tags still open
 * at the sign's end for free, so paying for that close here would only cost
 * characters.
 */
const translateParagraphContent = (nodes: JSONContent[], state: SignState, suppressTrailingClose: boolean): string => {
    let sizeDepth = 0;
    let activeSize: number | null = null;
    let activeVoffset: number | null = null;
    let activeMargin: number | null = null;
    let activeMarginRight: number | null = null;
    let activeHighlight: string | null = null;
    let italicOpen = false;
    let underlineOpen = false;
    let strikeOpen = false;
    let activeScript: Script | null = null;
    let out = '';

    const closeSize = () => {
        if (sizeDepth > 0) {
            out += '</size>'.repeat(sizeDepth);
            sizeDepth = 0;
            activeSize = null;
        }
    };
    // voffset/margin-left set an absolute value, so a new value just overrides; one close resets either.
    const closeVoffset = () => {
        if (activeVoffset != null) {
            out += '</voffset>';
            activeVoffset = null;
        }
    };
    // The game only knows `</margin>` (a literal `</margin-left>` prints on the sign), and it resets both
    // sides, so a margin that must end while the other stays open is reopened afterwards.
    const closeMargins = () => {
        if (activeMargin != null || activeMarginRight != null) {
            out += '</margin>';
            activeMargin = null;
            activeMarginRight = null;
        }
    };
    const closeHighlight = () => {
        if (activeHighlight != null) {
            out += '</mark>';
            activeHighlight = null;
        }
    };
    const closeItalic = () => {
        if (italicOpen) {
            out += '</i>';
            italicOpen = false;
        }
    };
    const closeUnderline = () => {
        if (underlineOpen) {
            out += '</u>';
            underlineOpen = false;
        }
    };
    const closeStrike = () => {
        if (strikeOpen) {
            out += '</s>';
            strikeOpen = false;
        }
    };
    const closeScript = () => {
        if (activeScript != null) {
            out += `</${activeScript}>`;
            activeScript = null;
        }
    };
    const closeAll = () => {
        closeScript();
        closeItalic();
        closeStrike();
        closeUnderline();
        closeVoffset();
        closeMargins();
        closeSize();
        closeHighlight();
    };

    nodes.forEach((node) => {
        if (node.type === 'hardBreak') {
            closeAll();
            out += SIGN_NEWLINE;
            return;
        }
        if (node.type !== 'text' && node.type !== 'sprite') {
            // only paragraph/text/sprite/hardBreak exist in this editor's schema (see editor-extensions.ts); a future extension must be handled here too
            return;
        }

        const { color, highlight, size, voffset, margin, marginRight, italic, underline, strike, script } = resolveRunStyle(node.marks);
        // a bare space shows no color, so it never needs a color tag; underline/strike lines take the color, so they do
        const colorless = node.type === 'text' && !underline && !strike && /^\s*$/.test(node.text ?? '');
        const runColor = colorless ? state.color : (color ?? DEFAULT_TEXT_COLOR);
        const colorChanges = runColor !== state.color;

        // closes, innermost first; a color change also closes u/s so they reopen in the new color
        if (script !== activeScript) {
            closeScript();
        }
        if (!italic) {
            closeItalic();
        }
        if (!strike || colorChanges) {
            closeStrike();
        }
        if (!underline || colorChanges) {
            closeUnderline();
        }
        if (size == null) {
            closeSize();
        }
        if (voffset == null) {
            closeVoffset();
        }
        if ((margin == null && activeMargin != null) || (marginRight == null && activeMarginRight != null)) {
            closeMargins();
        }
        if (highlight !== activeHighlight) {
            closeHighlight();
        }
        // opens, outermost (color) first
        if (colorChanges) {
            out += `<${shortenHexColor(runColor)}>`;
            state.color = runColor;
        }
        if (highlight != null && highlight !== activeHighlight) {
            out += `<mark=${highlight}>`;
            activeHighlight = highlight;
        }
        if (underline && !underlineOpen) {
            out += '<u>';
            underlineOpen = true;
        }
        if (strike && !strikeOpen) {
            out += '<s>';
            strikeOpen = true;
        }
        if (size != null && size !== activeSize) {
            out += `<size=${size}>`;
            sizeDepth += 1;
            activeSize = size;
        }
        if (voffset != null && voffset !== activeVoffset) {
            out += `<voffset=${voffset}>`;
            activeVoffset = voffset;
        }
        if (margin != null && margin !== activeMargin) {
            out += `<margin-left=${margin}>`;
            activeMargin = margin;
        }
        if (marginRight != null && marginRight !== activeMarginRight) {
            out += `<margin-right=${marginRight}>`;
            activeMarginRight = marginRight;
        }
        if (italic && !italicOpen) {
            out += '<i>';
            italicOpen = true;
        }
        if (script != null && script !== activeScript) {
            out += `<${script}>`;
            activeScript = script;
        }

        // a sprite is an atom carrying the same marks as surrounding text, so it tints/underlines like a glyph
        out += node.type === 'sprite' ? `<sprite=${node.attrs?.index ?? 0}>` : (node.text ?? '');
    });

    if (!suppressTrailingClose) {
        closeAll();
    }

    return out;
};

/**
 * Translates the sign editor's current content into the Unity Rich Text
 * markup Valheim's in-game sign UI understands. Bold is intentionally
 * dropped — the wiki documents `<b>` as valid but visually inert on a sign,
 * so keeping it out saves characters toward `SIGN_CHAR_LIMIT`. Literal
 * `<`/`>` characters typed into the sign are also passed through unescaped —
 * Unity rich text has no cheap escape mechanism, so this is a deliberate
 * power-user escape hatch rather than an oversight.
 */
export const translateSignText = (editor: Editor): string => translateSignDoc(editor.getJSON());

/** Same as `translateSignText`, for a document JSON (e.g. a not-yet-applied transaction's doc). */
export const translateSignDoc = (doc: JSONContent): string => {
    const paragraphs = doc.content ?? [];
    const state: SignState = { color: DEFAULT_TEXT_COLOR };
    const lastContentfulParagraph = [...paragraphs].reverse().find((paragraph) => (paragraph.content?.length ?? 0) > 0);

    return paragraphs
        .map((paragraph) =>
            translateParagraphContent(paragraph.content ?? [], state, paragraph === lastContentfulParagraph),
        )
        .join(SIGN_NEWLINE);
};
