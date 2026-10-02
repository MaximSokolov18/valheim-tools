'use client';

import type { ReactNode } from 'react';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { Italic, Underline, Strikethrough, Subscript, Superscript } from 'lucide-react';
import { useSignEditor } from '../model';
import { toggleItalic, toggleUnderline, toggleStrike, toggleSubscript, toggleSuperscript } from '../lib';
import { Toggle } from '../../../../components/ui/toggle';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

interface FormatDefinition {
    mark: 'italic' | 'underline' | 'strike' | 'subscript' | 'superscript';
    label: string;
    icon: ReactNode;
    toggle: (editor: Editor) => boolean;
}

const FORMATS: readonly FormatDefinition[] = [
    { mark: 'italic', label: 'Italic', icon: <Italic className="size-4" />, toggle: toggleItalic },
    { mark: 'underline', label: 'Underline', icon: <Underline className="size-4" />, toggle: toggleUnderline },
    { mark: 'strike', label: 'Strikethrough', icon: <Strikethrough className="size-4" />, toggle: toggleStrike },
    { mark: 'subscript', label: 'Subscript', icon: <Subscript className="size-4" />, toggle: toggleSubscript },
    { mark: 'superscript', label: 'Superscript', icon: <Superscript className="size-4" />, toggle: toggleSuperscript },
];

/**
 * Toolbar toggles for the on/off text formats (italic, underline,
 * strikethrough, subscript, superscript). Each acts on the selection, or arms
 * the format for the next typed characters at a collapsed caret, and shows
 * pressed while the selection / caret carries that mark.
 */
export const FormatButtons = () => {
    const editor = useSignEditor();
    const active = useEditorState({
        editor,
        selector: ({ editor }) =>
            Object.fromEntries(FORMATS.map(({ mark }) => [mark, editor?.isActive(mark) ?? false])),
    });

    return (
        <>
            {FORMATS.map(({ mark, label, icon, toggle }) => {
                const pressed = active?.[mark] ?? false;
                return (
                    <Toggle
                        key={mark}
                        aria-label={label}
                        pressed={pressed}
                        onMouseDown={preventFocusSteal}
                        onPressedChange={() => editor && toggle(editor)}
                        className="aria-pressed:bg-control-active aria-pressed:text-control-active-foreground bg-control text-control-foreground hover:bg-control-hover"
                    >
                        {icon}
                    </Toggle>
                );
            })}
        </>
    );
};
