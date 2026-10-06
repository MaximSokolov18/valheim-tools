import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
    it('links the main pages in a site navigation', () => {
        render(<SiteFooter />);
        const nav = within(screen.getByRole('navigation', { name: 'Site' }));
        expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        expect(nav.getByRole('link', { name: 'Sign Editor' })).toHaveAttribute('href', '/sign-editor');
        expect(nav.getByRole('link', { name: 'Sign Tag Guide' })).toHaveAttribute('href', '/guides/sign-formatting');
    });

    it('links every legal page', () => {
        render(<SiteFooter />);
        expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
        expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
    });

    it('asks players to report bugs to the support email', () => {
        render(<SiteFooter />);
        expect(screen.getByText(/Found a bug/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'support@vikingtools.eu' })).toHaveAttribute(
            'href',
            'mailto:support@vikingtools.eu',
        );
    });

    it('states that the project is unofficial', () => {
        render(<SiteFooter />);
        expect(screen.getByText(/not affiliated with, endorsed by or sponsored by/)).toBeInTheDocument();
    });
});
