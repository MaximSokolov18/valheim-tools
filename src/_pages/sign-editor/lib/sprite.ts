export interface SpriteOption {
    index: number;
    label: string;
}

/** Valheim sign text can reference 16 built-in graphics via `<sprite=N>`, N = 0–15. */
export const SPRITE_COUNT = 16;

/** The in-game sprite atlas (TextMesh Pro's default EmojiOne sheet): a 4×4 grid, indexed row by row. */
export const SPRITE_SHEET_URL = '/images/sign-sprites.webp';
const SPRITE_SHEET_COLUMNS = 4;

export const SPRITES: readonly SpriteOption[] = [
    { index: 0, label: 'Blushing smile' },
    { index: 1, label: 'Tongue out smile' },
    { index: 2, label: 'Heart eyes' },
    { index: 3, label: 'Sunglasses' },
    { index: 4, label: 'Grin' },
    { index: 5, label: 'Happy squint' },
    { index: 6, label: 'Laughing tears' },
    { index: 7, label: 'Wide grin' },
    { index: 8, label: 'Beaming' },
    { index: 9, label: 'Sweat smile' },
    { index: 10, label: 'Squinting' },
    { index: 11, label: 'Winking tongue' },
    { index: 12, label: 'Missing sprite' },
    { index: 13, label: 'Rolling laughter' },
    { index: 14, label: 'Smile' },
    { index: 15, label: 'Frown' },
];

export const isSpriteIndex = (value: unknown): value is number =>
    Number.isInteger(value) && (value as number) >= 0 && (value as number) < SPRITE_COUNT;

/** Inline style that shows sprite `index` from the atlas as a 1em-square, full-color image. */
export const spriteStyle = (index: number): string => {
    const col = index % SPRITE_SHEET_COLUMNS;
    const row = Math.floor(index / SPRITE_SHEET_COLUMNS);
    const step = 100 / (SPRITE_SHEET_COLUMNS - 1);
    return [
        `background-image:url(${SPRITE_SHEET_URL})`,
        `background-size:${SPRITE_SHEET_COLUMNS * 100}% ${SPRITE_SHEET_COLUMNS * 100}%`,
        `background-position:${col * step}% ${row * step}%`,
        'background-repeat:no-repeat',
        'display:inline-block',
        'width:1em',
        'height:1em',
        'vertical-align:-0.15em',
    ].join(';');
};
