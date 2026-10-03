import { Board } from './board';
import { Toolbar } from './toolbar';
import { CopySignPanel } from './copy-sign-panel';
import { SignEditorProvider } from '../model';

export const SignEditorPage = () => {
    return (
        <SignEditorProvider>
            <div
                className="relative isolate flex flex-col items-center justify-between gap-3 px-3 py-3 h-[calc(100dvh-var(--site-header-height,0px))]"
            >
                {/* Painted fjord stage behind the board, dissolving into the page. Decorative. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/scene/fjord-day.webp')] bg-cover bg-center opacity-70 mask-[radial-gradient(ellipse_70%_62%_at_50%_48%,black_35%,transparent_100%)] dark:bg-[url('/images/scene/fjord-night.webp')] dark:opacity-80"
                />
                <Toolbar />
                <Board />
                <CopySignPanel />
            </div>
        </SignEditorProvider>
    );
};
