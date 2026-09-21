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

interface RunStyle {
    color: string | null;
    size: number | null;
}

const resolveRunStyle = (marks: JSONContent['marks']): RunStyle => {
    const textStyle = marks?.find((mark) => mark.type === 'textStyle');
    return {
        color: normalizeHexColor(String(textStyle?.attrs?.color ?? '')),
        size: parseFontSize(textStyle?.attrs?.fontSize as string | null | undefined),
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
    let out = '';

    const closeSize = () => {
        if (sizeDepth > 0) {
            out += '</size>'.repeat(sizeDepth);
            sizeDepth = 0;
            activeSize = null;
        }
    };
    const closeColor = () => {
        if (colorDepth > 0) {
            out += '</color>'.repeat(colorDepth);
            colorDepth = 0;
            activeColor = null;
        }
    };

    nodes.forEach((node) => {
        if (node.type === 'hardBreak') {
            closeSize();
            closeColor();
            out += SIGN_NEWLINE;
            return;
        }
        if (node.type !== 'text') {
            // only paragraph/text/hardBreak exist in this editor's schema (see editor-extensions.ts); a future extension must be handled here too
            return;
        }

        const { color, size } = resolveRunStyle(node.marks);

        // closes, innermost (size) first
        if (size == null) {
            closeSize();
        }
        if (color == null) {
            closeColor();
        }
        // opens, outermost (color) first
        if (color != null && color !== activeColor) {
            out += `<${shortenHexColor(color)}>`;
            colorDepth += 1;
            activeColor = color;
        }
        if (size != null && size !== activeSize) {
            out += `<size=${size}>`;
            sizeDepth += 1;
            activeSize = size;
        }

        out += node.text ?? '';
    });

    if (!suppressTrailingClose) {
        closeSize();
        closeColor();
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
export const translateSignText = (editor: Editor): string => {
    const paragraphs = editor.getJSON().content ?? [];
    const lastContentfulParagraph = [...paragraphs].reverse().find((paragraph) => (paragraph.content?.length ?? 0) > 0);

    return paragraphs
        .map((paragraph) =>
            translateParagraphContent(paragraph.content ?? [], paragraph === lastContentfulParagraph),
        )
        .join(SIGN_NEWLINE);
};
