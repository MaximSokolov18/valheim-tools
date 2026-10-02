import { Board } from './board';
import { Toolbar } from './toolbar';
import { CopySignPanel } from './copy-sign-panel';
import { SignEditorProvider } from '../model';

export const SignEditorPage = () => {
    return (
        <SignEditorProvider>
            <div
                className="flex flex-col items-center justify-between h-[calc(100dvh-var(--site-header-height,0px))]"
            >
                <Toolbar />
                <Board />
                <CopySignPanel />
            </div>
        </SignEditorProvider>
    );
};
