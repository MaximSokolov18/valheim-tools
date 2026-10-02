import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignEditorInfo } from './sign-editor-info';

describe('SignEditorInfo', () => {
    it('explains the tool in a level-2 section, leaving the h1 to the page', () => {
        render(<SignEditorInfo />);
        expect(screen.getByRole('heading', { level: 2, name: /about the sign editor/i })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('links to the tag guide', () => {
        render(<SignEditorInfo />);
        expect(screen.getByRole('link', { name: /sign tag guide/i })).toHaveAttribute('href', '/guides/sign-formatting');
    });
});
