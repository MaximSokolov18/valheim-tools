import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { SignEditorProvider, useSignEditor } from '../editor-context';
import { DRAFT_KEY, loadDraft, saveDraft } from '../saved-signs-store';

let captured: Editor | null = null;
function Probe({ onEditor }: { onEditor: (editor: Editor | null) => void }) {
    onEditor(useSignEditor());
    return null;
}
const capture = (editor: Editor | null) => {
    captured = editor;
};

beforeEach(() => {
    localStorage.clear();
    captured = null;
});

describe('board draft', () => {
    it('opens with the board from the last visit, without an undo step back to empty', async () => {
        saveDraft({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'MEAD HALL' }] }] });
        render(
            <SignEditorProvider>
                <Probe onEditor={capture} />
            </SignEditorProvider>,
        );
        await waitFor(() => expect(captured?.getText()).toBe('MEAD HALL'));
        expect(captured?.can().undo()).toBe(false);
    });

    it('saves the board shortly after an edit', async () => {
        vi.useFakeTimers();
        try {
            render(
                <SignEditorProvider>
                    <Probe onEditor={capture} />
                </SignEditorProvider>,
            );
            await vi.waitFor(() => expect(captured).not.toBeNull());
            act(() => {
                captured!.commands.insertContent('TROLL');
            });
            expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
            act(() => {
                vi.advanceTimersByTime(500);
            });
            expect(loadDraft()?.content?.[0]?.content?.[0]?.text).toBe('TROLL');
        } finally {
            vi.useRealTimers();
        }
    });
});
