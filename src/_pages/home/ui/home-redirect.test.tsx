import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { HomeRedirect } from './home-redirect';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('HomeRedirect', () => {
    it('replaces the current route with /sign-editor on mount', () => {
        const replace = vi.fn();
        vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);

        render(<HomeRedirect />);

        expect(replace).toHaveBeenCalledWith('/sign-editor');
    });

    it('renders a fallback link to /sign-editor', () => {
        vi.mocked(useRouter).mockReturnValue({ replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);

        render(<HomeRedirect />);

        expect(screen.getByRole('link', { name: 'sign editor' })).toHaveAttribute('href', '/valheim-tool/sign-editor');
    });
});
