import { Note } from '../../../shared/ui/note';
import { TextLink } from '../../../shared/ui/text-link';

export function SignEditorInfo() {
    return (
        <section
            aria-labelledby="about-sign-editor"
            className="mx-auto max-w-3xl px-4 py-16 font-heading text-[1.02rem] leading-[1.7] [&_p]:mt-4"
        >
            <h2
                id="about-sign-editor"
                className="border-b-2 border-foreground pb-3 text-[1.9rem] font-medium leading-tight tracking-[-0.015em]"
            >
                About the Sign Editor
            </h2>
            <p className="mt-3">
                Type your sign text, add colors and emoji from the toolbar, and watch it appear on the sign board.
                When it looks right, copy the finished text and paste it into a sign in Valheim.
            </p>
            <Note variant="watch">
                <strong>The preview is a close guide, not a guarantee.</strong> A sign might look different in the game
                than it does here.
                <br />
                <br />
                The editor shows colors as they appear on a sign in soft, fairly dim light,
                so they look a little darker and duller than the picker swatch. In the game they can come out
                different, depending on the time of day, nearby light sources, the weather, and the sign&apos;s
                position. If the exact look matters, check the sign in the game.
            </Note>
            <p className="mt-3">
                Formatting tags count towards the game&apos;s limit of 50 characters per sign. The{' '}
                <TextLink href="/guides/sign-formatting">
                    sign tag guide
                </TextLink>{' '}
                lists every tag with its cost, plus the font and color quirks to watch for.
            </p>
            <p className="mt-3">
                The editor runs in your browser; your text is not sent to us. Viking Tools is an unofficial fan-made
                project.
            </p>
        </section>
    );
}
