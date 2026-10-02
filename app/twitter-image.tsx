import { renderSocialImage } from '@/shared/seo/social-image';

export const alt = 'Viking Tools: free sign editor and tools for Valheim players';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function Image() {
    return renderSocialImage();
}
