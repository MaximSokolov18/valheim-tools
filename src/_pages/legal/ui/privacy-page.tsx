import Link from 'next/link';
import { SITE } from '../../../shared/config/site';
import { LegalPage } from './legal-page';

export function PrivacyPage() {
    const { operator } = SITE;
    return (
        <LegalPage title="Privacy Policy">
            <p>
                This policy explains what personal data {SITE.name} (&quot;we&quot;) handles when you use{' '}
                {SITE.url.replace('https://', '')}, why, and what rights you have.
            </p>

            <h2>1. Who is responsible</h2>
            <p>
                Operator: {operator.name}, {operator.country}. Contact for privacy questions and requests:{' '}
                {operator.contactEmail}.
            </p>

            <h2>2. What we handle</h2>
            <ul>
                <li>
                    <strong>Your sign text.</strong> The sign editor runs in your browser. The text you type is not
                    sent to us.
                </li>
                <li>
                    <strong>Hosting data.</strong> The site is hosted on Firebase Hosting (Google). Like any web
                    server, it processes technical data such as your IP address, browser type and the time and address
                    of each request in order to deliver and secure the site. Legal basis: our legitimate interest in
                    running a secure website (Art. 6(1)(f) GDPR).
                </li>
                <li>
                    <strong>Messages you send us.</strong> If you email {operator.contactEmail}, we use your address and
                    message only to reply. Legal basis: our legitimate interest in answering you (Art. 6(1)(f) GDPR). We
                    delete the conversation when it is no longer needed.
                </li>
            </ul>

            <h2>3. Cookies, analytics and advertising</h2>
            <p>
                The site does not set cookies or use analytics, advertising or tracking. It does not store anything
                on your device or ask for an account. If this changes, we will ask for your consent first where the
                law requires it and update this policy.
            </p>

            <h2>4. Transfers outside the EU/EEA</h2>
            <p>
                Our hosting provider may process data in countries outside the EU/EEA, such as the United States.
                Where this happens it relies on an adequacy decision (for example the EU-US Data Privacy Framework)
                or standard contractual clauses.
            </p>

            <h2>5. How long we keep data</h2>
            <p>
                We do not keep personal data ourselves. Hosting logs are kept by our hosting provider only as long as
                needed for delivering and securing the site, under its own retention rules.
            </p>

            <h2>6. Your rights</h2>
            <p>
                Under the GDPR you can ask us for access to your data, correction, deletion, restriction of
                processing, a portable copy, and you can object to processing based on legitimate interests. To use
                your rights, email {operator.contactEmail}. You also have the right to complain to the data-protection
                supervisory authority in your country; in Spain this is the{' '}
                <a href="https://www.aepd.es" rel="noopener noreferrer">
                    Agencia Española de Protección de Datos
                </a>
                .
            </p>

            <h2>7. Children</h2>
            <p>
                The site is not directed at children under 16 and we do not knowingly collect their personal data.
            </p>

            <h2>8. Changes</h2>
            <p>
                We will update this page when our data handling changes and change the date at the top. See also our{' '}
                <Link href="/terms">Terms of Use</Link>.
            </p>
        </LegalPage>
    );
}
