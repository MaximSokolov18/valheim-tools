import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { HomePage } from './home-page';

describe('HomePage', () => {
    it('has exactly one h1 naming the brand', () => {
        render(<HomePage />);
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent('Viking Tools');
    });

    it('links to the sign editor and the tag guide', () => {
        render(<HomePage />);
        expect(screen.getAllByRole('link', { name: /open the sign editor/i })[0]).toHaveAttribute('href', '/sign-editor');
        expect(screen.getByRole('link', { name: /read the sign tag guide/i })).toHaveAttribute(
            'href',
            '/guides/sign-formatting',
        );
    });

    it('links the privacy FAQ answer to the privacy policy', () => {
        render(<HomePage />);
        expect(within(screen.getByRole('region', { name: /questions/i })).getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
    });

    it('answers the "is it official" question and shows the disclaimer', () => {
        render(<HomePage />);
        expect(screen.getByRole('heading', { name: /is viking tools official/i })).toBeInTheDocument();
        expect(
            within(screen.getByRole('contentinfo')).getByText(/not affiliated with, endorsed by or sponsored by/),
        ).toBeInTheDocument();
    });

    it('embeds WebSite structured data', () => {
        render(<HomePage />);
        const script = document.querySelector('script[type="application/ld+json"]');
        expect(script?.textContent).toContain('"@type":"WebSite"');
    });
});
