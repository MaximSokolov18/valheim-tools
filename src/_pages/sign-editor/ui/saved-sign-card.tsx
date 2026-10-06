'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { CharCount } from '../../../shared/ui/char-count';
import { CopyButton } from '../../../shared/ui/copy-button';
import { SIGN_CHAR_LIMIT } from '../lib';
import { SIGN_NAME_MAX_LENGTH, normalizeSignName, type SavedSign } from '../lib/saved-signs';
import { SignBoardView } from './sign-board-view';

interface SavedSignCardProps {
    sign: SavedSign;
    /** The board is editing this sign. */
    active: boolean;
    /** ...and has changes not saved to it yet. */
    unsaved: boolean;
    onOpen: (sign: SavedSign) => void;
    onRename: (sign: SavedSign, name: string) => void;
    onDelete: (sign: SavedSign) => void;
}

/** One saved sign: its board (click to open it), name, size, and copy / rename / delete. */
export function SavedSignCard({ sign, active, unsaved, onOpen, onRename, onDelete }: SavedSignCardProps) {
    const [renaming, setRenaming] = useState(false);
    const [draftName, setDraftName] = useState(sign.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renaming) inputRef.current?.select();
    }, [renaming]);

    const startRename = () => {
        setDraftName(sign.name);
        setRenaming(true);
    };
    const commitRename = () => {
        if (!renaming) return;
        setRenaming(false);
        const name = normalizeSignName(draftName, sign.name);
        if (name !== sign.name) onRename(sign, name);
    };

    return (
        <li>
            <article
                aria-label={sign.name}
                aria-current={active ? 'true' : undefined}
                className={cn(
                    'rounded-lg border border-border bg-background/60 p-2 transition-colors',
                    active && 'border-primary ring-2 ring-primary/40',
                )}
            >
                <button
                    type="button"
                    onClick={() => onOpen(sign)}
                    aria-label={`Open ${sign.name}`}
                    className="block w-full cursor-pointer rounded-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    <SignBoardView doc={sign.doc} />
                </button>

                <div className="mt-2 flex min-h-7 items-center gap-2">
                    {renaming ? (
                        <input
                            ref={inputRef}
                            value={draftName}
                            maxLength={SIGN_NAME_MAX_LENGTH}
                            aria-label={`Name for ${sign.name}`}
                            onChange={(event) => setDraftName(event.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') commitRename();
                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    setRenaming(false);
                                }
                            }}
                            className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-[0.75rem] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        />
                    ) : (
                        <p className="min-w-0 flex-1 truncate text-[0.75rem] font-semibold" title={sign.name}>
                            {sign.name}
                        </p>
                    )}
                    <CharCount count={sign.markup.length} limit={SIGN_CHAR_LIMIT} className="shrink-0 text-[0.65rem]" />
                </div>

                {active && (
                    <p className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.08em] uppercase">
                        <span className={unsaved ? 'text-warning' : 'text-moss'}>
                            {unsaved ? 'On the board · unsaved changes' : 'On the board'}
                        </span>
                    </p>
                )}

                <div className="mt-2 flex items-center gap-1">
                    <CopyButton value={sign.markup} label={`Copy ${sign.name}`} variant="secondary" className="h-7 text-xs" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={startRename}
                        aria-label={`Rename ${sign.name}`}
                        title="Rename"
                        className="ml-auto size-7"
                    >
                        <Pencil aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(sign)}
                        aria-label={`Delete ${sign.name}`}
                        title="Delete"
                        className="size-7 hover:text-destructive"
                    >
                        <Trash2 aria-hidden />
                    </Button>
                </div>
            </article>
        </li>
    );
}
