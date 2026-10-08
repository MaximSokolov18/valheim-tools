import Link from 'next/link';
import { SITE } from '../../../shared/config/site';
import { LegalPage } from './legal-page';

const GOOGLE_IRELAND = 'Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland';

export function PrivacyPage() {
    const { operator } = SITE;
    return (
        <LegalPage title="Privacy Policy">
            <p>
                This policy explains what personal data {SITE.name} (&quot;we&quot;) handles when you visit{' '}
                {SITE.url.replace('https://', '')}, why we handle it and what rights you have.
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
                    sent to us or to anyone else.
                </li>
                <li>
                    <strong>Hosting data.</strong> The site is hosted on Firebase Hosting (Google Cloud), which acts as our processor under{' '}
                    <a href="https://cloud.google.com/terms/data-processing-addendum" rel="noopener noreferrer">
                        Google&apos;s data processing terms
                    </a>
                    . Like any web
                    server, it processes technical data such as your IP address, browser type and the time and address
                    of each request in order to deliver and secure the site. Legal basis: our legitimate interest in
                    running a secure website (Art. 6(1)(f) GDPR).
                </li>
                <li>
                    <strong>Messages you send us.</strong> If you email {operator.contactEmail}, we use your address and
                    message only to reply. Legal basis: our legitimate interest in answering you (Art. 6(1)(f) GDPR). We
                    delete the conversation when it is no longer needed.
                </li>
                <li>
                    <strong>Your consent choice, statistics and ads.</strong> If you allow it, we measure how the site is
                    used and show ads, as explained in sections 3 to 5.
                </li>
            </ul>

            <h2>3. Your consent, and what is stored on your device</h2>
            <p>
                If you visit from the European Economic Area, the United Kingdom or Switzerland, a consent message asks
                whether you allow statistics and advertising. Until you choose, and if you say no, the site loads no
                analytics or advertising code and sets no cookies for them. You can say no as easily as yes.
            </p>
            <p>
                The message is provided by Google (Privacy &amp; messaging, a consent tool certified under the IAB
                Transparency &amp; Consent Framework). To show it, your browser contacts Google, which receives
                technical data such as your IP address. Your choice is stored in cookies on this site whose names
                begin with &quot;FC&quot;, for up to 13 months, so you are not asked on every page. Legal basis: our
                legal obligation to ask for and be able to prove consent (Art. 6(1)(c) and Art. 7(1) GDPR).
            </p>
            <p>
                The site also keeps a few things in your browser&apos;s local storage so it works the way you left
                it: your light or dark theme choice (under the key &quot;vt-theme&quot;), and the sign editor&apos;s
                draft, saved signs and recently used colors (keys beginning with &quot;vt-sign-editor:&quot;). These
                stay on your device, are never sent to us and are not used to identify you. They are needed for
                features you use, so they do not require consent. You can remove them at any time by clearing the
                site&apos;s data in your browser.
            </p>

            <h2>4. Statistics (Google Analytics)</h2>
            <p>
                Only if you consent, we use Google Analytics 4, provided by {GOOGLE_IRELAND}, to understand how many
                people use the site and which pages and tools are useful. Google acts as our processor.
            </p>
            <ul>
                <li>
                    <strong>What is collected:</strong> pages you view, the page you came from, approximate location
                    (country or city, derived from your IP address; Google does not store IP addresses for visitors in
                    the EU), device, browser and operating system type, screen size, language, and interactions such as
                    scrolling, outbound link clicks and time on page.
                </li>
                <li>
                    <strong>Cookies:</strong> &quot;_ga&quot; and &quot;_ga_&lt;ID&gt;&quot;, which hold a random
                    identifier, for up to 13 months.
                </li>
                <li>
                    <strong>Limits we set:</strong> Google signals and ad personalisation are turned off, and statistics
                    data is not used for advertising. Event data is deleted after 2 months.
                </li>
                <li>
                    <strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR and Art. 22(2) of Spain&apos;s
                    LSSI), which you can withdraw at any time (see section 6).
                </li>
            </ul>

            <h2>5. Advertising (Google AdSense)</h2>
            <p>
                Some pages show ads, marked &quot;Advertisement&quot;, which help keep the site free. They are
                provided by Google AdSense ({GOOGLE_IRELAND}). For advertising, Google acts as an independent
                controller, under its own privacy policy.
            </p>
            <ul>
                <li>
                    <strong>When ads load:</strong> only if you consent to Google storing and accessing information on
                    your device. If you also allow personalised ads, Google may choose ads based on your interests;
                    otherwise it shows non-personalised ads based on context such as the page and your general
                    location.
                </li>
                <li>
                    <strong>What is collected:</strong> Google and the ad technology partners listed in the consent
                    message may use cookies (for example &quot;__gads&quot; and &quot;__gpi&quot; on this site, and
                    cookies on Google&apos;s own domains) and process your IP address and device data to deliver and
                    measure ads, limit how often you see the same ad, and prevent fraud. The consent message lists every
                    partner and purpose.
                </li>
                <li>
                    <strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR and Art. 22(2) LSSI).
                </li>
                <li>
                    <strong>More information:</strong>{' '}
                    <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">
                        how Google uses information from sites that use its services
                    </a>
                    , and{' '}
                    <a href="https://myadcenter.google.com" rel="noopener noreferrer">
                        My Ad Center
                    </a>{' '}
                    to manage ad personalisation in your Google account.
                </li>
            </ul>

            <h2>6. Changing or withdrawing consent</h2>
            <p>
                Use &quot;Privacy settings&quot; in the footer of any page to reopen the consent message and change
                your choice. When you withdraw consent, the site removes the Analytics and advertising cookies set on
                this site and reloads the page without them. Withdrawing does not affect processing that happened
                before. You can also block or delete cookies in your browser settings.
            </p>
            <p>
                Outside the European Economic Area, the United Kingdom and Switzerland no consent message is shown and
                statistics and ads load by default. If your browser sends a Global Privacy Control signal, we treat it
                as a refusal and load neither, wherever you are.
            </p>

            <h2>7. Transfers outside the EU/EEA</h2>
            <p>
                Google may process data in countries outside the EU/EEA, such as the United States. Google LLC is
                certified under the EU-US Data Privacy Framework, for which the European Commission has adopted an
                adequacy decision; Google also relies on standard contractual clauses.
            </p>

            <h2>8. How long we keep data</h2>
            <ul>
                <li>Hosting logs: as long as our hosting provider needs them to deliver and secure the site.</li>
                <li>Consent choice: up to 13 months, then you are asked again.</li>
                <li>Analytics: cookies up to 13 months; event data 2 months.</li>
                <li>Advertising: under Google&apos;s own retention rules.</li>
                <li>Emails: until the conversation is no longer needed.</li>
            </ul>

            <h2>9. Your rights</h2>
            <p>
                Under the GDPR you can ask us for access to your data, correction, deletion, restriction of
                processing, a portable copy, and you can object to processing based on legitimate interests. Where
                processing is based on your consent, you can withdraw it at any time. To use your rights, email{' '}
                {operator.contactEmail}. You also have the right to complain to the data-protection supervisory
                authority in your country; in Spain this is the{' '}
                <a href="https://www.aepd.es" rel="noopener noreferrer">
                    Agencia Española de Protección de Datos
                </a>
                .
            </p>

            <h2>10. Children</h2>
            <p>
                The site is not directed at children under 16 and we do not knowingly collect their personal data.
            </p>

            <h2>11. Changes</h2>
            <p>
                We will update this page when our data handling changes and change the date at the top. See also our{' '}
                <Link href="/terms">Terms of Use</Link>.
            </p>
        </LegalPage>
    );
}
