export { signEditorExtensions } from './editor-extensions';
export { toggleBold, setFontSize, clearFontSize, setTextColor, clearTextColor } from './commands';
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
export { TEXT_COLOR_PRESETS, isValidHexColor, normalizeHexColor, resolveActiveColor } from './text-color';
