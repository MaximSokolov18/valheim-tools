export { signEditorExtensions } from './editor-extensions';
export {
    toggleBold,
    setFontSize,
    clearFontSize,
    setTextColor,
    setTextColorTransient,
    unsetTextColorTransient,
    insertEmoji,
} from './commands';
export { resolveClickSelection } from './resolve-click-selection';
export { computeAutoFitFontSize } from './auto-fit-font-size';
export type { FontSizeFitCheck } from './auto-fit-font-size';
export {
    BASE_FONT_SIZE,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    FONT_SIZE_PRESETS,
    clampFontSize,
    parseFontSize,
    formatFontSize,
    resolveActiveFontSize,
} from './font-size';
export {
    TEXT_COLOR_PRESETS,
    DEFAULT_TEXT_COLOR,
    isValidHexColor,
    normalizeHexColor,
    resolveActiveColor,
} from './text-color';
export { hexToHsv, hsvToHex } from './hsv-color';
export type { Hsv } from './hsv-color';
export { toGameColor, GAME_COLOR_FILTER, GAME_COLOR_FILTER_ID, GAME_COLOR_MATRIX_VALUES } from './game-color';
export { showSelectionHighlight, hideSelectionHighlight } from './selection-highlight';
export { translateSignText, SIGN_CHAR_LIMIT } from './translate-sign-text';
export { EMOJI_CATEGORIES } from './emoji';
export type { EmojiOption, EmojiCategory } from './emoji';
