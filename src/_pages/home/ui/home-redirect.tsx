'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HomeRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/sign-editor');
    }, [router]);

    return (
        <p>
            Redirecting to the <a href="/sign-editor">sign editor</a>...
        </p>
    );
}
