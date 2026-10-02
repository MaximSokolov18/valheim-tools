import Link from 'next/link';
import { SITE } from '../../../shared/config/site';
import { LegalPage } from './legal-page';

export function TermsPage() {
    return (
        <LegalPage title="Terms of Use">
            <p>
                By using {SITE.name} you agree to these terms. If you do not agree, please do not use the site.
            </p>

            <h2>1. What the site is</h2>
            <p>
                {SITE.name} offers free browser tools for players of the game Valheim, such as a sign editor. {SITE.disclaimer}
            </p>

            <h2>2. Using the tools</h2>
            <ul>
                <li>You may use the tools for personal, non-commercial purposes.</li>
                <li>Do not misuse the site: no attacks, scraping at a harmful rate, or attempts to disrupt it.</li>
                <li>
                    The text you write stays in your browser. You are responsible for what you put on signs in the
                    game.
                </li>
            </ul>

            <h2>3. Accuracy of information</h2>
            <p>
                Guides and tag information are based on observation of the game, are not official documentation and may
                be wrong or become outdated after a game update. Check the result in the game.
            </p>

            <h2>4. Our content</h2>
            <p>
                The site&apos;s design, text and code are protected by copyright. Game names and any trademarks belong
                to their respective owners and are used only to describe what the tools are for.
            </p>

            <h2>5. Links</h2>
            <p>
                The site may link to other sites. We do not control them and are not responsible for their content. See
                the <Link href="/privacy">Privacy Policy</Link> for how we handle personal data.
            </p>

            <h2>6. Availability and liability</h2>
            <p>
                The tools are provided &quot;as is&quot; and may change or be unavailable at times. To the extent
                permitted by law we are not liable for losses arising from using the site. Nothing here limits
                liability that cannot be limited by law, such as for intent, gross negligence or injury to life, body
                or health, or your mandatory consumer rights.
            </p>

            <h2>7. Governing law</h2>
            <p>
                These terms are governed by the law of {SITE.operator.country}. If you are a consumer, this does not
                take away the mandatory consumer protections of the country where you live or your right to bring a
                claim in its courts.
            </p>

            <h2>8. Changes</h2>
            <p>
                We may update these terms; the date at the top shows the latest version. If you keep using the site
                after a change, you accept the updated terms.
            </p>

            <h2>9. Contact</h2>
            <p>
                {SITE.operator.name}, {SITE.operator.country}. Email: {SITE.operator.contactEmail}.
            </p>
        </LegalPage>
    );
}
