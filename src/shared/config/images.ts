const BOARDS = {
    /** Dark weathered planks. */
    dark: '/images/boards/board-dark.webp',
    /** Honey oak; keeps default black sign text readable (the guide's tag examples). */
    oak: '/images/boards/board-oak.webp',
} as const;

/** Painted artwork under public/images, for code that needs the paths. */
export const IMAGES = {
    boards: BOARDS,
    /** The sign editor's board. Guide previews of ready-made signs use it too, so they match the editor. */
    editorBoard: BOARDS.dark,
    scene: {
        far: '/images/scene/layer-far.webp',
        mid: '/images/scene/layer-mid.webp',
        near: '/images/scene/layer-near.webp',
        ship: '/images/scene/longship.webp',
    },
} as const;
