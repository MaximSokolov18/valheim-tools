import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { EditorContext } from '@tiptap/react';
import { signEditorExtensions } from '../../lib';
import { Toolbar } from '../toolbar';

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

describe('Toolbar format buttons', () => {
    it.each(['Italic', 'Underline', 'Strikethrough', 'Subscript', 'Superscript'])('renders a %s toggle', (name) => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
    });

    it('applies and shows the format on the selection', () => {
        const editor = renderWithEditor('<p>hello</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });
        fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
        expect(editor.getHTML()).toBe('<p><em>hello</em></p>');
        expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
    });
});

describe('Toolbar font size', () => {
    it('renders the font size control', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: /^Font size/ })).toBeInTheDocument();
    });
});

describe('Toolbar offsets', () => {
    it('renders the vertical and horizontal offset controls', () => {
        renderWithEditor('<p>hello</p>');
        expect(screen.getByRole('button', { name: 'Vertical offset' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Horizontal offset' })).toBeInTheDocument();
    });

    it('shows a right margin as a negative horizontal offset', () => {
        renderWithEditor('<p><span style="--sign-margin-right: 6">hello</span></p>');
        expect(screen.getByRole('button', { name: 'Horizontal offset: -6' })).toBeInTheDocument();
    });
});
