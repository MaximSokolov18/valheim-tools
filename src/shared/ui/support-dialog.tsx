'use client';

import {Coffee, ExternalLink, Heart, HandHeart} from 'lucide-react';
import {cn} from '../../../lib/utils';
import {Button} from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../../../components/ui/dialog';
import {SUPPORT_LINKS} from '../config/site';
import {Spot} from './spot';

const ICONS = {'ko-fi': HandHeart, 'buy-me-a-coffee': Coffee} as const;

/** Header button that opens a short thank-you note with the two tip links. */
export function SupportDialog ({className}: {className?: string}) {
    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button
                        variant="ghost"
                        className={cn(
                            'size-9 gap-1.5 rounded-full px-0 text-[0.8rem] font-medium text-muted-foreground hover:text-foreground sm:h-10 sm:w-auto sm:px-3',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                            className
                        )}
                    />
                }
            >
                <Heart className="size-4.5 text-primary" aria-hidden/>
                <span className="sr-only sm:not-sr-only">Support</span>
            </DialogTrigger>
            <DialogContent
                className="gap-5 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-panel)] sm:max-w-md">
                <DialogHeader className="items-center gap-3 text-center">
                    <Spot name="hammer" className="w-20"/>
                    <DialogTitle className="font-heading text-[1.4rem] font-medium tracking-[-0.01em]">
                        Support Viking Tools
                    </DialogTitle>
                    <DialogDescription className="text-[0.75rem] leading-relaxed">
                        Viking Tools is free, with no ads or tracking, and I build it in my spare time. If it helped you
                        sort your chests, a small tip helps keep it running and supports the development of new tools.
                        Only if you’d like to support it. Thank you!
                    </DialogDescription>
                </DialogHeader>
                <ul className="grid gap-2">
                    {SUPPORT_LINKS.map((link) => {
                        const Icon = ICONS[link.id];
                        return (
                            <li key={link.id}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        'group flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 transition-colors',
                                        'hover:border-primary/60 hover:bg-control',
                                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
                                    )}
                                >
                                    <span
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Icon className="size-5" aria-hidden/>
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="text-[0.8rem] font-medium text-foreground">{link.name}</span>
                                        <span className="text-[0.65rem] text-muted-foreground">{link.host}</span>
                                    </span>
                                    <ExternalLink
                                        className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                                        aria-hidden
                                    />
                                    <span className="sr-only">(opens in a new tab)</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
                <p className="text-center text-[0.6rem] text-balance text-muted-foreground">
                    You pay on Ko-fi or Buy Me a Coffee. Viking Tools never sees your payment details.
                </p>
            </DialogContent>
        </Dialog>
    );
}
