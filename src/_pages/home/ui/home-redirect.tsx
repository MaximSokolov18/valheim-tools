'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HomeRedirect() {
    const router = useRouter();

    useEffect(() => {
        // next/navigation's router auto-applies basePath, so this stays bare.
        router.replace('/sign-editor');
    }, [router]);

    return (
        <p>
            {/* Plain <a> tags are NOT auto-prefixed with basePath, unlike router.replace above. */}
            Redirecting to the <a href="/valheim-tool/sign-editor">sign editor</a>...
        </p>
    );
}
