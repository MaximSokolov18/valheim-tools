/** Reports whether content would fit without overflowing at the given font size. */
export type FontSizeFitCheck = (fontSizePx: number) => boolean;

/**
 * Binary-searches `[min, max]` for the largest font size that still fits, per `fits`.
 * Falls back to `min` when nothing fits (never renders below the floor) and when
 * `min >= max`.
 */
export const computeAutoFitFontSize = (params: {
    min: number;
    max: number;
    fits: FontSizeFitCheck;
}): number => {
    const { min, max, fits } = params;
    if (min >= max) {
        return min;
    }

    let lo = min;
    let hi = max;
    let best = min;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (fits(mid)) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return best;
};
