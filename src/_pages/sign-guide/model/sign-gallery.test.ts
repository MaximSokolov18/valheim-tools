import { describe, expect, it } from 'vitest';
import { GALLERY_SIGNS, galleryFitsLimit } from './sign-gallery';

describe('GALLERY_SIGNS', () => {
    it('has six signs, each within the 50-character limit', () => {
        expect(GALLERY_SIGNS).toHaveLength(6);
        for (const sign of GALLERY_SIGNS) expect(galleryFitsLimit(sign), sign.label).toBe(true);
    });
});
