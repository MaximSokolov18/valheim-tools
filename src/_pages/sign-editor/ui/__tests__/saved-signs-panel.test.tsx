import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/core';
import { SignEditorProvider, savedSignsStore, useSignEditor } from '../../model';
import { SavedSignsPanel } from '../saved-signs-panel';

let editor: Editor | null = null;
function Probe({ onEditor }: { onEditor: (instance: Editor | null) => void }) {
    onEditor(useSignEditor());
    return null;
}
const capture = (instance: Editor | null) => {
    editor = instance;
};

const setup = async () => {
    const user = userEvent.setup();
    render(
        <SignEditorProvider>
            <Probe onEditor={capture} />
            <SavedSignsPanel />
        </SignEditorProvider>,
    );
    await waitFor(() => expect(editor).not.toBeNull());
    return user;
};
const type = (text: string) => act(() => void editor!.commands.setContent(`<p>${text}</p>`, { emitUpdate: true }));
const list = () => screen.getByRole('list', { name: 'Saved signs' });

beforeEach(() => {
    localStorage.clear();
    savedSignsStore.reset();
    editor = null;
});

describe('SavedSignsPanel', () => {
    it('starts empty and only offers saving once the board has text', async () => {
        const user = await setup();
        expect(screen.getByText('No saved signs yet')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save sign/i })).toBeDisabled();

        type('MEAT');
        await user.click(screen.getByRole('button', { name: /save sign/i }));

        expect(within(list()).getByRole('article', { name: 'MEAT' })).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Saved as MEAT');
        expect(savedSignsStore.getState().signs[0]).toMatchObject({ name: 'MEAT', markup: 'MEAT' });
    });

    it('marks edits as unsaved and saves them back to the open sign', async () => {
        const user = await setup();
        type('MEAT');
        await user.click(screen.getByRole('button', { name: /save sign/i }));
        expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();

        type('MEAT CHEST');
        expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes to MEAT');
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(savedSignsStore.getState().signs).toHaveLength(1);
        expect(savedSignsStore.getState().signs[0].markup).toBe('MEAT CHEST');
        expect(screen.getByRole('status')).toHaveTextContent('Saved as MEAT');
    });

    it('opens a saved sign onto the board, and Undo brings the previous board back', async () => {
        const user = await setup();
        type('ORE');
        await user.click(screen.getByRole('button', { name: /save sign/i }));
        await user.click(screen.getByRole('button', { name: /new sign/i }));
        type('WOOD');

        await user.click(screen.getByRole('button', { name: 'Open ORE' }));
        expect(editor!.getText()).toBe('ORE');
        expect(screen.getByRole('status')).toHaveTextContent('Saved as ORE');

        await user.click(await screen.findByRole('button', { name: 'Undo' }));
        expect(editor!.getText()).toBe('WOOD');
        expect(screen.getByRole('status')).toHaveTextContent('New sign, not saved yet');
    });

    it('renames inline, and deletes with an Undo', async () => {
        const user = await setup();
        type('MEAD');
        await user.click(screen.getByRole('button', { name: /save sign/i }));

        await user.click(screen.getByRole('button', { name: 'Rename MEAD' }));
        const input = screen.getByRole('textbox', { name: 'Name for MEAD' });
        await user.clear(input);
        await user.type(input, 'Mead chest{Enter}');
        expect(within(list()).getByRole('article', { name: 'Mead chest' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Delete Mead chest' }));
        expect(screen.getByText('No saved signs yet')).toBeInTheDocument();
        await user.click(await screen.findByRole('button', { name: 'Undo' }));
        expect(within(list()).getByRole('article', { name: 'Mead chest' })).toBeInTheDocument();
        expect(savedSignsStore.getState().activeId).toBe(savedSignsStore.getState().signs[0].id);
    });
});
