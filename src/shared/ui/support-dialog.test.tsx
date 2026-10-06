import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportDialog } from './support-dialog';

describe('SupportDialog', () => {
    it('opens a dialog with both tip links that open in a new tab', async () => {
        const user = userEvent.setup();
        render(<SupportDialog />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Support' }));
        const dialog = within(await screen.findByRole('dialog', { name: 'Support Viking Tools' }));

        const koFi = dialog.getByRole('link', { name: /Ko-fi/ });
        expect(koFi).toHaveAttribute('href', 'https://ko-fi.com/vikingtools');
        expect(koFi).toHaveAttribute('target', '_blank');
        expect(koFi).toHaveAttribute('rel', 'noopener noreferrer');
        expect(dialog.getByRole('link', { name: /Buy Me a Coffee/ })).toHaveAttribute(
            'href',
            'https://buymeacoffee.com/vikingtools',
        );
    });

    it('closes with the close button', async () => {
        const user = userEvent.setup();
        render(<SupportDialog />);
        await user.click(screen.getByRole('button', { name: 'Support' }));
        await user.click(await screen.findByRole('button', { name: 'Close' }));
        await expect.poll(() => screen.queryByRole('dialog')).toBeNull();
    });
});
