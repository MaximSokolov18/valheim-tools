import type { Editor, JSONContent } from '@tiptap/core';
import { parseFontSize } from './font-size';
import { normalizeHexColor } from './text-color';

/** Valheim's in-game sign text box caps input at 50 characters, tags included. */
export const SIGN_CHAR_LIMIT = 50;

/**
 * The two literal characters Valheim's sign renderer turns into a line break
 * when pasted (`\n`, backslash + n) — not an actual line-feed, and two
 * characters cheaper than `<br>`. See the Valheim wiki's sign-styling rules.
 */
const SIGN_NEWLINE = '\\n';

const wrapWithMarks = (text: string, marks: JSONContent['marks']): string => {
    const textStyle = marks?.find((mark) => mark.type === 'textStyle');
    const color = normalizeHexColor(String(textStyle?.attrs?.color ?? ''));
    const size = parseFontSize(textStyle?.attrs?.fontSize as string | null | undefined);

    let wrapped = text;
    if (size != null) {
        wrapped = `<size=${size}>${wrapped}</size>`;
    }
    if (color) {
        wrapped = `<color=${color}>${wrapped}</color>`;
    }
    return wrapped;
};

const translateInlineNode = (node: JSONContent): string => {
    if (node.type === 'hardBreak') {
        return SIGN_NEWLINE;
    }
    if (node.type === 'text') {
        return wrapWithMarks(node.text ?? '', node.marks);
    }
    // only paragraph/text/hardBreak exist in this editor's schema (see editor-extensions.ts); a future extension must be handled here too
    return '';
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
    return paragraphs
        .map((paragraph) => (paragraph.content ?? []).map(translateInlineNode).join(''))
        .join(SIGN_NEWLINE);
};
