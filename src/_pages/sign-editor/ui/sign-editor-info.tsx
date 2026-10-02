import Link from 'next/link';

export function SignEditorInfo() {
    return (
        <section aria-labelledby="about-sign-editor" className="font-body mx-auto max-w-3xl px-4 py-12">
            <h2 id="about-sign-editor" className="font-heading text-3xl">
                About the Sign Editor
            </h2>
            <p className="mt-3">
                Type your sign text, choose colours, sizes and emoji from the toolbar, and see the result on a sign
                board as you go. When it looks right, copy the finished text and paste it into a sign in Valheim.
            </p>
            <p className="mt-3">
                Formatting tags count towards the game&apos;s limit of 50 characters per sign. The{' '}
                <Link href="/guides/sign-formatting" className="underline underline-offset-4">
                    sign tag guide
                </Link>{' '}
                lists every tag with its cost, plus the font and colour quirks to expect.
            </p>
            <p className="mt-3">
                The editor runs in your browser; your text is not sent to us. Viking Tools is an unofficial fan-made
                project.
            </p>
        </section>
    );
}
