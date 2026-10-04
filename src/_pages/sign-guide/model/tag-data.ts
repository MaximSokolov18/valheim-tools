export type TagRow = {
    /** The text exactly as typed on the sign. */
    example: string;
    effect: string;
    /** Characters it uses from the 50-character budget. */
    cost: number;
    /** False when `example` is only a description, not literal text. */
    measured?: false;
};

export const TAG_ROWS: readonly TagRow[] = [
    { example: '<i>', effect: 'Italic (slanted) text.', cost: 3 },
    {
        example: '<u>',
        effect: 'Underline. The line keeps the color that was active when the tag opened, so put the color tag first.',
        cost: 3,
    },
    { example: '<s>', effect: 'Strikethrough. Colored the same way as underline.', cost: 3 },
    { example: '<#f00>', effect: 'Color from a 3-digit hex code.', cost: 6 },
    { example: '<#ff0000>', effect: 'Color from a 6-digit hex code.', cost: 9 },
    {
        example: '<#0f08>',
        effect: 'A 4th digit sets opacity. This one is green at about half strength. The 8-digit form takes two opacity digits.',
        cost: 7,
    },
    { example: '<color=red>', effect: 'Color by name. A hex code gives the same result in fewer characters.', cost: 11 },
    {
        example: '<size=9>',
        effect: 'Text size. Sizes are absolute and linear: 9 is nine fifths the height of 5, and there is no upper limit.',
        cost: 8,
    },
    {
        example: '<size=-16>',
        effect: 'Upside-down, heavier text. While the text is short, a negative value is relative to the auto-fit size of 8 (-16 is a flipped 8, -8 vanishes). Once the text is long enough to shrink, it is read as absolute.',
        cost: 10,
    },
    { example: '<voffset=-4>', effect: 'Shifts text down; positive values shift it up.', cost: 12 },
    { example: '<cspace=1>', effect: 'Letter spacing; negative values tighten it.', cost: 10 },
    { example: '<mspace=6>', effect: 'Gives every glyph the same width.', cost: 10 },
    { example: '<sub>', effect: 'Subscript.', cost: 5 },
    { example: '<sup>', effect: 'Superscript.', cost: 5 },
    {
        example: '<mark=#ffff00>',
        effect: 'Highlight block behind the text. It needs the full 6-digit hex (or 8 with opacity); shorter codes are ignored.',
        cost: 14,
    },
    { example: '<align=left>', effect: 'Aligns the line. Also accepts center and right.', cost: 12 },
    { example: '<margin-left=8>', effect: 'Insets the left edge. margin-right works the same way.', cost: 15 },
    {
        example: '<smallcaps>',
        effect: 'Draws lowercase-typed characters as shorter capitals. Characters typed as capitals keep full height.',
        cost: 11,
    },
    {
        example: '<uppercase>',
        effect: 'No visible effect, because the font already draws lowercase as capitals. The same goes for <lowercase>.',
        cost: 11,
    },
    { example: '<rotate=20>', effect: 'Rotates every glyph in place.', cost: 11 },
    { example: '<nobr>', effect: 'Stops a run of text from wrapping.', cost: 6 },
    { example: '<sprite=0>', effect: 'One of 16 built-in emoji graphics, numbered 0 to 15.', cost: 10 },
    { example: '\\n', effect: 'Line break.', cost: 2 },
    { example: '\\v', effect: 'Line break, identical to \\n.', cost: 2 },
    {
        example: '\\r',
        effect: 'Carriage return: starts a new line at the same height as the previous one, so the following text is drawn over it.',
        cost: 2,
    },
    { example: '\\t', effect: 'Tab.', cost: 2 },
    {
        example: '(a real line break)',
        effect: 'Also breaks the line, and also costs two characters, so it is no cheaper than \\n.',
        cost: 2,
        measured: false,
    },
    { example: '<br>', effect: 'Line break, but twice the price of \\n.', cost: 4 },
];
