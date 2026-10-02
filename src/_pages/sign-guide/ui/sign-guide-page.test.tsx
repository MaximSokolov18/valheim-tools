import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TAG_ROWS } from '../model/tag-data';
import { SignGuidePage } from './sign-guide-page';

describe('SignGuidePage', () => {
    it('has exactly one h1', () => {
        render(<SignGuidePage />);
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('renders one table row per tag plus the header', () => {
        render(<SignGuidePage />);
        expect(screen.getAllByRole('row')).toHaveLength(TAG_ROWS.length + 1);
    });

    it('links back to the editor and says the notes are observed, not official', () => {
        render(<SignGuidePage />);
        expect(screen.getAllByRole('link', { name: /sign editor/i }).length).toBeGreaterThan(0);
        expect(screen.getByText(/not official\s+documentation/i)).toBeInTheDocument();
    });

    it('embeds article and breadcrumb structured data', () => {
        render(<SignGuidePage />);
        const json = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map((script) => script.textContent)
            .join('');
        expect(json).toContain('"@type":"TechArticle"');
        expect(json).toContain('"@type":"BreadcrumbList"');
    });
});
