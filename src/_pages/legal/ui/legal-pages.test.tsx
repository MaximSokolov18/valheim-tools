import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SITE } from '../../../shared/config/site';
import { PrivacyPage } from './privacy-page';
import { TermsPage } from './terms-page';

describe.each([
    ['PrivacyPage', PrivacyPage, 'Privacy Policy'],
    ['TermsPage', TermsPage, 'Terms of Use'],
])('%s', (_name, Page, title) => {
    it('has exactly one h1 with the page title', () => {
        render(<Page />);
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent(title);
    });

    it('shows when it was last updated', () => {
        render(<Page />);
        expect(screen.getByText(new RegExp(SITE.legalUpdated))).toBeInTheDocument();
    });
});

describe('PrivacyPage', () => {
    it('names the operator contact', () => {
        render(<PrivacyPage />);
        expect(screen.getAllByText(new RegExp(SITE.operator.contactEmail.replace(/[[\]]/g, '\\$&'))).length).toBeGreaterThan(0);
    });

    it('states that there are no cookies, analytics or advertising, and discloses the theme preference', () => {
        render(<PrivacyPage />);
        expect(screen.getByText(/does not set cookies, run analytics or show advertising/i)).toBeInTheDocument();
        expect(screen.getByText(/light or dark theme choice/i)).toBeInTheDocument();
    });

    it('explains the data-subject rights and the right to complain', () => {
        render(<PrivacyPage />);
        expect(screen.getByRole('heading', { name: /your rights/i })).toBeInTheDocument();
        expect(screen.getByText(/supervisory authority/i)).toBeInTheDocument();
    });
});

describe('TermsPage', () => {
    it('repeats the non-affiliation notice', () => {
        render(<TermsPage />);
        expect(within(screen.getByRole('article')).getByText(/not affiliated with, endorsed by or sponsored by/)).toBeInTheDocument();
    });
});
