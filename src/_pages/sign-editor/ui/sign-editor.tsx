import { Board } from './board';
import { Toolbar } from './toolbar';
import { SignEditorProvider } from '../model';

export const SignEditorPage = () => {
    return (
        <SignEditorProvider>
            <div
                className="flex flex-col items-center justify-between h-dvh"
            >
                <Toolbar />
                <Board />
                <div>Copy sign feature</div>
            </div>
        </SignEditorProvider>
    );
};
