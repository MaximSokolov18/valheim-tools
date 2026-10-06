import { Extension, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { SIZE_UNIT_VAR } from './font-size';

/**
 * Valheim's `<voffset=N>` (baseline shift) and `<margin-left=N>` (left inset) as per-run `textStyle`
 * attributes. Like `<size>`, the number is read in sign units (the same scale as `<size>`), so it is
 * drawn against the board's `--sign-unit`. TextMeshPro documents `voffset` as signed (positive moves up)
 * and ignores negative margins; both stay in effect until closed.
 */
export type OffsetKind = 'verticalOffset' | 'marginLeft' | 'marginRight';

interface OffsetSpec {
    min: number;
    max: number;
    presets: readonly number[];
    /** CSS custom property that carries the raw value so pasted/serialized HTML round-trips. */
    cssVar: string;
}

export const OFFSET_SPECS: Record<OffsetKind, OffsetSpec> = {
    verticalOffset: { min: -100, max: 100, presets: [-8, -4, -2, 2, 4, 8], cssVar: '--sign-voffset' },
    marginLeft: { min: 1, max: 100, presets: [2, 4, 6, 8, 10, 12], cssVar: '--sign-margin-left' },
    marginRight: { min: 1, max: 100, presets: [2, 4, 6, 8, 10, 12], cssVar: '--sign-margin-right' },
};

/** Round to an integer and clamp to the kind's range; non-finite input gives `null`. */
export const clampOffset = (kind: OffsetKind, value: number): number | null => {
    if (!Number.isFinite(value)) {
        return null;
    }
    const { min, max } = OFFSET_SPECS[kind];
    return Math.min(max, Math.max(min, Math.round(value)));
};

/** Parse a stored or typed offset (an optionally signed number); anything else is `null`. A stored `0` is no offset. */
export const parseOffset = (kind: OffsetKind, value: string | null | undefined): number | null => {
    if (value == null || !/^\s*-?\d+(?:\.\d+)?\s*$/.test(value)) {
        return null;
    }
    const number = Number(value);
    if (kind !== 'verticalOffset' && number <= 0) {
        return null; // the game ignores negative margins
    }
    const clamped = clampOffset(kind, number);
    return clamped === 0 ? null : clamped;
};

const offsetCss = (value: number) => `calc(${value} * var(${SIZE_UNIT_VAR}))`;

/**
 * The toolbar's one horizontal control over both margins, signed like `<voffset>`: `N` is `<margin-left=N>` (the
 * line moves right) and `-N` is `<margin-right=N>` (it moves left). Same range as each margin.
 */
export const HORIZONTAL_OFFSET_SPEC = {
    min: -OFFSET_SPECS.marginRight.max,
    max: OFFSET_SPECS.marginLeft.max,
    presets: [-12, -8, -4, 4, 8, 12],
} as const;

/** Parse a typed horizontal offset (an optionally signed number), rounded and clamped; `0` or anything else is `null`. */
export const parseHorizontalOffset = (value: string | null | undefined): number | null => {
    if (value == null || !/^\s*-?\d+(?:\.\d+)?\s*$/.test(value)) {
        return null;
    }
    const { min, max } = HORIZONTAL_OFFSET_SPEC;
    const clamped = Math.min(max, Math.max(min, Math.round(Number(value))));
    return clamped === 0 ? null : clamped;
};

/**
 * The signed horizontal offset covering the whole selection (left margin minus right margin), or `null` when it
 * has no margin or the margins are mixed.
 */
export const resolveActiveHorizontalOffset = (editor: Editor): number | null => {
    const attrs = editor.getAttributes('textStyle');
    const left = parseOffset('marginLeft', attrs.marginLeft as string | undefined);
    const right = parseOffset('marginRight', attrs.marginRight as string | undefined);
    if (left == null && right == null) {
        return null;
    }
    const uniform = editor.isActive('textStyle', {
        marginLeft: attrs.marginLeft ?? null,
        marginRight: attrs.marginRight ?? null,
    });
    const value = (left ?? 0) - (right ?? 0);
    return uniform && value !== 0 ? value : null;
};

/** The offset (sign units) covering the whole selection, or `null` when none or mixed. */
export const resolveActiveOffset = (editor: Editor, kind: OffsetKind): number | null => {
    const raw = editor.getAttributes('textStyle')[kind] as string | undefined;
    const value = parseOffset(kind, raw);
    if (value == null) {
        return null;
    }
    return editor.isActive('textStyle', { [kind]: raw }) ? value : null;
};

/**
 * Adds the `verticalOffset` and `marginLeft` attributes to `textStyle`. A vertical offset is drawn with
 * `vertical-align`, which also grows the line to make room for the raised text, as TextMeshPro does (so the block
 * is re-centered: unsized text rises by about half the offset, text that fills its line by all of it). A left or right margin only carries its value here: `LineShifts` draws it (the line is
 * centered in the room the margins leave, i.e. moved by half of their difference), because a margin belongs to a
 * line, not to each differently-marked piece of text. Wrapped lines are not re-indented.
 */
export const TextOffset = Extension.create({
    name: 'textOffset',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    verticalOffset: {
                        default: null,
                        parseHTML: (element) => {
                            const raw = element.style.getPropertyValue(OFFSET_SPECS.verticalOffset.cssVar).trim();
                            return parseOffset('verticalOffset', raw) == null ? null : raw;
                        },
                        renderHTML: (attributes) =>
                            attributes.verticalOffset
                                ? {
                                      style: `${OFFSET_SPECS.verticalOffset.cssVar}: ${attributes.verticalOffset}; vertical-align: ${offsetCss(Number(attributes.verticalOffset))}`,
                                  }
                                : {},
                    },
                    ...Object.fromEntries(
                        (['marginLeft', 'marginRight'] as const).map((kind) => [
                            kind,
                            {
                                default: null,
                                parseHTML: (element: HTMLElement) => {
                                    const raw = element.style.getPropertyValue(OFFSET_SPECS[kind].cssVar).trim();
                                    return parseOffset(kind, raw) == null ? null : raw;
                                },
                                renderHTML: (attributes: Record<string, unknown>) =>
                                    attributes[kind] ? { style: `${OFFSET_SPECS[kind].cssVar}: ${attributes[kind]}` } : {},
                            },
                        ]),
                    ),
                },
            },
        ];
    },
});

/** The `<margin-left>` / `<margin-right>` (sign units) carried by one inline node; 0 where there is none. */
export const readMargins = (node: PMNode | null | undefined): { left: number; right: number } => {
    const mark = node?.marks.find((m) => m.type.name === 'textStyle');
    const read = (kind: 'marginLeft' | 'marginRight') =>
        parseOffset(kind, mark?.attrs[kind] as string | null | undefined) ?? 0;
    return { left: read('marginLeft'), right: read('marginRight') };
};

/**
 * The widest left and right margins (sign units) of any line, each read from the line's first glyph. The game
 * fits unsized text into the width these leave, so the editor reserves that much before auto-fitting.
 */
export const maxLineMargins = (doc: PMNode): { left: number; right: number } => {
    const max = { left: 0, right: 0 };
    doc.forEach((paragraph) => {
        let atLineStart = true;
        paragraph.forEach((node) => {
            if (node.type.name === 'hardBreak') {
                atLineStart = true;
                return;
            }
            if (atLineStart) {
                const { left, right } = readMargins(node);
                max.left = Math.max(max.left, left);
                max.right = Math.max(max.right, right);
                atLineStart = false;
            }
        });
    });
    return max;
};
