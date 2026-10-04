import { Card, CardContent } from '../../../../components/ui/card';
import { CharCount } from '../../../../components/char-count';
import { CopyButton } from '../../../../components/copy-button';
import { SIGN_CHAR_LIMIT } from '../../sign-editor/lib/translate-sign-text';
import { GALLERY_SIGNS } from '../model/sign-gallery';
import { SignMarkup } from './sign-markup';
import { SignPreview } from './sign-preview';

/** "Six signs worth stealing": ready-made signs to copy into the game. */
export function SignGallery() {
    return (
        <ul className="font-body mt-6 grid gap-5 sm:grid-cols-2">
            {GALLERY_SIGNS.map((sign) => (
                <li key={sign.label} className="flex">
                    <Card className="w-full gap-0 rounded-2xl py-3 shadow-[var(--shadow-panel)] sm:py-4">
                        <CardContent className="flex flex-1 flex-col px-3 sm:px-4">
                            <SignPreview markup={sign.markup} board="editor" />
                            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
                                <h3 className="font-heading text-[1.05rem] font-medium">{sign.label}</h3>
                                <CharCount count={sign.markup.length} limit={SIGN_CHAR_LIMIT} className="text-[0.7rem]" />
                            </div>
                            <div className="mt-2 flex items-end justify-between gap-3 text-[0.75rem]">
                                <SignMarkup markup={sign.markup} className="bg-transparent! p-0!" />
                                <CopyButton
                                    value={sign.markup}
                                    label={`Copy the ${sign.label} markup`}
                                    variant="secondary"
                                    className="shrink-0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </li>
            ))}
        </ul>
    );
}
