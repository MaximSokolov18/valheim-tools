import { buildAdsTxt, GOOGLE } from '@/shared/config/google';

export const dynamic = 'force-static';

export function GET() {
    return new Response(buildAdsTxt(GOOGLE.publisherId), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
