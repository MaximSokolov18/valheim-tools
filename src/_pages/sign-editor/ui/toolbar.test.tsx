import { describe, it, expect } from 'vitest';
import { render, screen} from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../lib';
import { Toolbar } from './toolbar';

const renderWithEditor = (content: string) => {
    const editor = new Editor({ extensions: signEditorExtensions, content });
    render(
        <EditorContext.Provider value={{ editor }}>
            <Toolbar />
        </EditorContext.Provider>,
    );
    return editor;
};

describe('Toolbar text-color picker', () => {
    it('renders the text-color picker alongside the bold button', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: /^Text color/ })).toBeInTheDocument();
    });
});

describe('Toolbar emoji picker', () => {
    it('renders the emoji picker alongside the text-color picker', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: 'Insert emoji' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Text color/ })).toBeInTheDocument();
    });
});
