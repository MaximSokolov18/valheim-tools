'use client';

import { useSyncExternalStore } from 'react';
import { consentStore, reopenConsentMessage } from '../lib/consent';

/**
 * Footer entry that reopens Google's consent message, so visitors can change or withdraw consent as easily as
 * they gave it. Shown only where the message applies and once its API is ready (before that a click would do nothing).
 */
export function PrivacySettingsButton({ className }: { className?: string }) {
    const { canReopen } = useSyncExternalStore(consentStore.subscribe, consentStore.get, consentStore.getServerSnapshot);
    if (!canReopen) return null;
    return (
        <li>
            <button type="button" onClick={() => reopenConsentMessage()} className={className}>
                Privacy settings
            </button>
        </li>
    );
}
