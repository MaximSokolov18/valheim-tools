'use client';

import { Toast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Global manager, so non-React code (e.g. editor extensions) can raise toasts. */
export const toastManager = Toast.createToastManager();

const ToastList = () => {
    const { toasts } = Toast.useToastManager();

    return toasts.map((toast) => (
        <Toast.Root
            key={toast.id}
            toast={toast}
            className={cn(
                'relative w-80 rounded-lg border bg-background p-3 pr-9 text-sm shadow-lg transition-opacity',
                'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
                toast.type === 'error' && 'border-destructive',
            )}
        >
            <Toast.Content>
                <Toast.Title className={cn('font-bold', toast.type === 'error' && 'text-destructive')} />
                <Toast.Description className="mt-1 text-muted-foreground" />
                {/* Renders only when the toast was added with `actionProps` (e.g. an "Undo" button). */}
                <Toast.Action className="mt-2 rounded-md bg-control px-2 py-1 text-xs font-bold text-control-foreground transition-colors hover:bg-control-hover" />
                <Toast.Close
                    aria-label="Close"
                    className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <X className="size-4" aria-hidden />
                </Toast.Close>
            </Toast.Content>
        </Toast.Root>
    ));
};

/** Mount once; shows `toastManager` toasts in the top-right corner. */
export const Toaster = ({ timeout = 4000 }: { timeout?: number }) => (
    <Toast.Provider toastManager={toastManager} timeout={timeout} limit={1}>
        <Toast.Portal>
            <Toast.Viewport className="fixed right-4 top-4 z-50 flex flex-col gap-2">
                <ToastList />
            </Toast.Viewport>
        </Toast.Portal>
    </Toast.Provider>
);
