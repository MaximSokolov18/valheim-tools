import type { ReactNode } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { CharCount } from '../../../../components/char-count';
import { SIGN_CHAR_LIMIT } from '../../sign-editor/lib/translate-sign-text';
import { SignMarkup } from './sign-markup';
import { SignPreview } from './sign-preview';

/**
 * A numbered figure: one or two sign previews, each with its markup and count,
 * and a caption. Previews are decorative; the markup is the readable content.
 */
export function SignExample({
    number,
    markups,
    children,
}: {
    number: number;
    markups: readonly string[];
    children: ReactNode;
}) {
    return (
        <figure className="font-body my-8">
            <div className={markups.length > 1 ? 'grid gap-4 sm:grid-cols-2' : 'mx-auto max-w-md'}>
                {markups.map((markup) => (
                    <Card key={markup} className="gap-0 rounded-2xl py-3 shadow-[var(--shadow-panel)] sm:py-4">
                        <CardContent className="px-3 sm:px-4">
                            <SignPreview markup={markup} />
                            <div className="mt-3 flex items-start justify-between gap-3 border-t border-border pt-3 text-[0.75rem]">
                                <SignMarkup markup={markup} className="bg-transparent! p-0!" />
                                <CharCount count={markup.length} limit={SIGN_CHAR_LIMIT} className="shrink-0 text-[0.7rem]" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Fig. {number}</span> {children}
            </figcaption>
        </figure>
    );
}
