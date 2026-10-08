import { Board } from './board';
import { Toolbar } from './toolbar';
import { CopySignPanel } from './copy-sign-panel';
import { SignEditorProvider } from '../model';
import { SavedSignsPanel } from './saved-signs-panel';
import { AdSlot } from '../../../shared/ui/ad-slot';

/** The rail only fits beside the board on large screens; below this the board keeps the full width. */
const RAIL_MEDIA = '(min-width: 1536px) and (min-height: 800px)';

export const SignEditorPage = () => {
    return (
        <SignEditorProvider>
            {/* Board and tools on the left, saved signs on the right; below the board on smaller screens. */}
            <div className="relative isolate flex flex-col gap-3 px-3 py-3 lg:h-[calc(100dvh-var(--site-header-height,0px))] lg:flex-row">
                {/* Painted fjord stage behind the board, dissolving into the page. Decorative. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/scene/fjord-day.webp')] bg-cover bg-center opacity-70 mask-[radial-gradient(ellipse_70%_62%_at_50%_48%,black_35%,transparent_100%)] dark:bg-[url('/images/scene/fjord-night.webp')] dark:opacity-80"
                />
                {/* Ad rail on the far left, as far from the toolbar and Copy button as the layout allows. */}
                <AdSlot placement="editorRail" format="rail" media={RAIL_MEDIA} className="mr-6 self-center" />
                {/* The board's own column: it sizes the board to the space between the toolbar and the copy panel. */}
                <div className="flex h-[calc(100dvh-var(--site-header-height,0px)-1.5rem)] min-w-0 flex-col items-center justify-between gap-3 lg:h-full lg:flex-1">
                    <Toolbar />
                    {/* The space left between them; the board fits it by width and height (`cqw`/`cqh`). */}
                    <div className="flex min-h-0 w-full flex-1 items-center justify-center [container-type:size]">
                        <Board />
                    </div>
                    <CopySignPanel />
                </div>
                <SavedSignsPanel className="lg:h-full lg:w-[17.5rem] lg:shrink-0" />
            </div>
        </SignEditorProvider>
    );
};
