import type { Editor, JSONContent } from '@tiptap/core';
import { parseFontSize } from './font-size';
import { normalizeHexColor, shortenHexColor } from './text-color';

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
        italic: has('italic'),
        underline: has('underline'),
        strike: has('strike'),
        script: has('subscript') ? 'sub' : has('superscript') ? 'sup' : null,
    };
};

/**
 * Emits the minimal Unity Rich Text markup for one paragraph's inline nodes.
 * `<color>`/`<size>` stay in effect until explicitly closed, so an
 * already-open tag never needs closing just to switch to a *different*
 * value — the next run's own opening tag overrides it outright, same as
 * `<color=green>green <color=blue>blue</color> green</color>` nests rather
 * than requiring `</color>` before every new `<color>`. Closing tags are
 * only emitted where the following content has no tag of its own and would
 * otherwise inherit still-open styling, and — since a still-open tag can be
 * many runs deep by that point — as many closing tags as remain open.
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
const translateParagraphContent = (nodes: JSONContent[], suppressTrailingClose: boolean): string => {
    let colorDepth = 0;
    let sizeDepth = 0;
    let activeColor: string | null = null;
    let activeSize: number | null = null;
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
    const closeHighlight = () => {
        if (activeHighlight != null) {
            out += '</mark>';
            activeHighlight = null;
        }
    };
    const closeColor = () => {
        if (colorDepth > 0) {
            out += '</color>'.repeat(colorDepth);
            colorDepth = 0;
            activeColor = null;
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
        closeSize();
        closeHighlight();
        closeColor();
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

        const { color, highlight, size, italic, underline, strike, script } = resolveRunStyle(node.marks);
        const colorChanges = color !== activeColor;

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
        if (highlight !== activeHighlight) {
            closeHighlight();
        }
        if (color == null) {
            closeColor();
        }
        // opens, outermost (color) first
        if (color != null && colorChanges) {
            out += `<${shortenHexColor(color)}>`;
            colorDepth += 1;
            activeColor = color;
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
    const lastContentfulParagraph = [...paragraphs].reverse().find((paragraph) => (paragraph.content?.length ?? 0) > 0);

    return paragraphs
        .map((paragraph) =>
            translateParagraphContent(paragraph.content ?? [], paragraph === lastContentfulParagraph),
        )
        .join(SIGN_NEWLINE);
};
