export const BORDER_ID = 'sign-editor-border';
export const TEXT_AREA_ID = 'sign-editor-text-area';

/** The sign's text box on the board art; shared by the editor and the read-only boards of saved signs. */
export const BOARD_TEXT_AREA_CLASS =
    'relative w-[90%] h-[80%] py-[2.4%] flex flex-col justify-center text-black [&_[data-sprite]]:bg-none!';

/** CSS variable on the board: 1 at full size, smaller when big text makes the board shrink to fit the screen. */
export const BOARD_SCALE_VAR = '--sign-board-scale';
