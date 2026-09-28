import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { cleanup } from '@testing-library/react';

// Tests build Tiptap editors without ever destroying them. ProseMirror's DOMObserver
// keeps a pending timer per view, and on a slow runner (CI) it fires after jsdom is
// torn down -> "ReferenceError: document is not defined" as an unhandled error.
// Track every Editor created and destroy it after each test.
const createdEditors: Array<{ isDestroyed: boolean; destroy: () => void }> = [];

// `createView` is private in Tiptap's typings but runs from the Editor constructor.
const editorProto = Editor.prototype as unknown as { createView: (...args: unknown[]) => unknown };
const originalCreateView = editorProto.createView;
editorProto.createView = function (this: Editor, ...args: unknown[]) {
    createdEditors.push(this);
    return originalCreateView.apply(this, args);
};

afterEach(() => {
    cleanup();
    for (const editor of createdEditors.splice(0)) {
        if (!editor.isDestroyed) editor.destroy();
    }
});

// Base UI's Popover positioner observes element size; jsdom has no ResizeObserver.
if (!('ResizeObserver' in globalThis)) {
    class ResizeObserverStub {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
