export interface EmojiOption {
    char: string;
    label: string;
}

export interface EmojiCategory {
    label: string;
    emoji: EmojiOption[];
}

/**
 * The default emoji offered by the toolbar's emoji picker, grouped to match
 * the in-game sign symbol reference the user supplied. Any other emoji can
 * still be pasted into a sign directly — this list only backs the picker's
 * dropdown, not what's allowed in the document.
 */
export const EMOJI_CATEGORIES: readonly EmojiCategory[] = [
    {
        label: 'Food & Farm',
        emoji: [
            { char: '🥩', label: 'Raw meat' },
            { char: '🍗', label: 'Cooked meat' },
            { char: '🐟', label: 'Fish' },
            { char: '🍯', label: 'Honey' },
            { char: '🍄', label: 'Mushroom' },
            { char: '🥕', label: 'Carrot' },
            { char: '🫐', label: 'Blueberries' },
            { char: '🌾', label: 'Barley' },
            { char: '🌲', label: 'Sapling' },
            { char: '🍺', label: 'Mead' },
            { char: '🍲', label: 'Stew' },
            { char: '🥛', label: 'Milk' },
            { char: '🧀', label: 'Cheese' },
        ],
    },
    {
        label: 'Gear & War',
        emoji: [
            { char: '⚔️', label: 'Swords' },
            { char: '🗡️', label: 'Dagger' },
            { char: '🛡️', label: 'Shield' },
            { char: '🏹', label: 'Bow' },
            { char: '⛏️', label: 'Pickaxe' },
            { char: '🔨', label: 'Hammer' },
            { char: '🪓', label: 'Axe' },
            { char: '🧰', label: 'Toolbox' },
            { char: '👑', label: 'Crown' },
            { char: '💍', label: 'Ring' },
            { char: '🧪', label: 'Potion' },
            { char: '🔥', label: 'Fire' },
            { char: '⚡', label: 'Lightning' },
            { char: '💧', label: 'Water drop' },
        ],
    },
    {
        label: 'Materials',
        emoji: [
            { char: '🪵', label: 'Wood' },
            { char: '🪨', label: 'Stone' },
            { char: '💰', label: 'Coins' },
            { char: '💎', label: 'Gem' },
            { char: '🧵', label: 'Thread' },
            { char: '🟠', label: 'Amber' },
            { char: '🟫', label: 'Bronze' },
            { char: '🔩', label: 'Iron' },
            { char: '🥇', label: 'Gold medal' },
            { char: '🥈', label: 'Silver medal' },
            { char: '🥉', label: 'Bronze medal' },
        ],
    },
    {
        label: 'Beasts',
        emoji: [
            { char: '🦌', label: 'Deer' },
            { char: '🐗', label: 'Boar' },
            { char: '🐴', label: 'Lox' },
            { char: '🐝', label: 'Bee' },
            { char: '🕷️', label: 'Spider' },
            { char: '🐍', label: 'Serpent' },
            { char: '🐢', label: 'Turtle' },
            { char: '🐞', label: 'Beetle' },
            { char: '💀', label: 'Skull' },
            { char: '☠️', label: 'Skull and crossbones' },
            { char: '🧟', label: 'Draugr' },
            { char: '👹', label: 'Troll' },
            { char: '🐌', label: 'Snail' },
        ],
    },
    {
        label: 'Places',
        emoji: [
            { char: '🏠', label: 'House' },
            { char: '🏰', label: 'Fortress' },
            { char: '⛺', label: 'Tent' },
            { char: '📜', label: 'Scroll' },
            { char: '🌀', label: 'Portal' },
            { char: '🚧', label: 'Beacon' },
            { char: '🖼️', label: 'Painting' },
            { char: '🧭', label: 'Compass' },
            { char: '⚓', label: 'Anchor' },
            { char: '🌊', label: 'Ocean' },
            { char: '🌿', label: 'Plant' },
            { char: '🛏️', label: 'Bed' },
            { char: '📦', label: 'Chest' },
        ],
    },
    {
        label: 'Signals',
        emoji: [
            { char: '✅', label: 'Check' },
            { char: '❌', label: 'Cross' },
            { char: '❗', label: 'Exclamation' },
            { char: '❓', label: 'Question' },
            { char: '⚠️', label: 'Warning' },
            { char: '⭐', label: 'Star' },
            { char: '✨', label: 'Sparkles' },
            { char: '❤️', label: 'Red heart' },
            { char: '💚', label: 'Green heart' },
            { char: '💙', label: 'Blue heart' },
            { char: '➡️', label: 'Right arrow' },
            { char: '⬅️', label: 'Left arrow' },
            { char: '⬆️', label: 'Up arrow' },
            { char: '⬇️', label: 'Down arrow' },
            { char: '🔔', label: 'Bell' },
            { char: '🔒', label: 'Lock' },
            { char: '🔑', label: 'Key' },
            { char: '💤', label: 'Sleep' },
        ],
    },
];
