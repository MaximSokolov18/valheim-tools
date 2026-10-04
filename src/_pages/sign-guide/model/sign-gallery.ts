import { SIGN_CHAR_LIMIT } from '../../sign-editor/lib/translate-sign-text';

export type GallerySign = {
    /** What the sign is for. */
    label: string;
    /** The text exactly as typed on the sign. `\\n` is the two-character line break. */
    markup: string;
};

/**
 * Ready-made chest labels for the guide's "Six signs worth stealing", each within
 * the 50-character limit. Sorting chests is the most common use of signs: an
 * emoji from the editor's picker and a coloured heading, then the contents.
 * Every line has its own light colour, because the editor's dark board hides
 * the default black text. Each sign was built in the Sign Editor to check it;
 * the markup here leaves out the `</color>` the editor adds before each line
 * break, which costs 8 characters and changes nothing.
 */
export const GALLERY_SIGNS: readonly GallerySign[] = [
    { label: 'Meat chest', markup: '<#f88>🥩 MEAT\\n<#fff>raw + cooked' },
    { label: 'Ore chest', markup: '<#fa5>⛏ ORE\\n<#fff>copper + tin' },
    { label: 'Wood chest', markup: '<#db8>🪵 WOOD\\n<#fff>fine + core' },
    { label: 'Seed chest', markup: '<#9e6>🌾 SEEDS\\n<#fff>carrot + turnip' },
    { label: 'Mead chest', markup: '<#fd5>🍺 MEADS\\n<#fff>health + stamina' },
    { label: 'Trophy chest', markup: '<#8df>💀 TROPHIES\\n<#fff>boss summons' },
];

export const galleryFitsLimit = (sign: GallerySign) => sign.markup.length <= SIGN_CHAR_LIMIT;
