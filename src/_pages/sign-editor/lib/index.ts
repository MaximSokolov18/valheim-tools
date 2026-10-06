export { signEditorExtensions, createSignEditorExtensions } from './editor-extensions';
export { SizedLines } from './sized-lines';
export { LineShifts, setLineShifts, measureLineShifts } from './line-shifts';
export {
    TextOffset,
    OFFSET_SPECS,
    OFFSET_PRESETS,
    HORIZONTAL_OFFSET_SPEC,
    clampOffset,
    parseOffset,
    parseHorizontalOffset,
    resolveActiveOffset,
    resolveActiveHorizontalOffset,
    maxLineMargins,
    readMargins,
} from './text-offset';
export type { OffsetKind } from './text-offset';
export { SignLengthLimit } from './sign-length-limit';
export {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleSubscript,
    toggleSuperscript,
    setFontSize,
    clearFontSize,
    setTextOffset,
    clearTextOffset,
    setHorizontalOffset,
    clearHorizontalOffset,
    setTextColor,
    setTextColorTransient,
    unsetTextColorTransient,
    setHighlightColor,
    clearHighlightColor,
    insertEmoji,
    insertSprite,
    clearFormatting,
    clearSign,
} from './commands';
export { resolveClickSelection } from './resolve-click-selection';
export { computeAutoFitFontSize } from './auto-fit-font-size';
export type { FontSizeFitCheck } from './auto-fit-font-size';
export {
    AUTO_FIT_SIZE,
    MIN_AUTO_FIT_SIZE,
    STAGE_WIDTH,
    STAGE_TEXT_AREA_WIDTH,
    SIZE_UNIT_PX,
    SIZE_UNIT_VAR,
    SIZE_VALUE_VAR,
    sizeToCss,
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
export { translateSignText, translateSignDoc, SIGN_CHAR_LIMIT } from './translate-sign-text';
export { EMOJI_CATEGORIES } from './emoji';
export type { EmojiOption, EmojiCategory } from './emoji';
export { SPRITES, SPRITE_COUNT, SPRITE_SHEET_URL, spriteStyle } from './sprite';
export type { SpriteOption } from './sprite';
