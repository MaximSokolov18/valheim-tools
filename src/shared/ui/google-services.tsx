'use client';

import { useEffect } from 'react';
import { GOOGLE } from '../config/google';
import { startGoogleServices } from '../lib/consent';

/**
 * Starts Google's consent message and, after consent, Analytics and AdSense. Renders nothing.
 * Without a publisher ID in the build env it does nothing at all (local, test and fork builds).
 */
export function GoogleServices() {
    useEffect(() => {
        startGoogleServices(GOOGLE);
    }, []);
    return null;
}
