import { useEffect } from 'react';

/**
 * next/font only fetches a unicode-range-subsetted font once a matching glyph
 * is rendered, which would otherwise be when a popover first opens (flashing
 * fallback glyphs). Request the font for `text` once the page has loaded, so
 * it doesn't compete with page load but is ready before it's needed.
 *
 * @param cssVariable CSS variable on the root element holding the font family,
 *   e.g. `--font-noto-emoji`.
 * @param text Characters that will be rendered; only the font files covering
 *   them are fetched.
 */
export const useFontPreload = (cssVariable: string, text: string) => {
    useEffect(() => {
        const preload = () => {
            const family = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
            if (!family) return;
            document.fonts.load(`1em ${family}`, text).catch(() => {});
        };

        if (document.readyState === 'complete') {
            preload();
            return;
        }
        window.addEventListener('load', preload, { once: true });
        return () => window.removeEventListener('load', preload);
    }, [cssVariable, text]);
};
