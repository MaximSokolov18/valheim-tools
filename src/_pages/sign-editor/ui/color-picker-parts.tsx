'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '../../../../lib/utils';

const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/** Small caps heading for one group inside a color popover. */
export const PickerSection = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => {
    const id = useId();
    return (
        <div role="group" aria-labelledby={id} className={cn('flex flex-col gap-1', className)}>
            <span id={id} className="text-[0.6rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {title}
            </span>
            {children}
        </div>
    );
};

/**
 * A row of color swatch buttons. Like the other toolbar controls, swatches
 * prevent mousedown default so clicking one keeps the editor selection.
 */
export const SwatchRow = ({
    colors,
    activeColor,
    onPick,
    labelFor,
}: {
    colors: readonly { hex: string; label: string }[];
    activeColor: string | null;
    onPick: (hex: string) => void;
    labelFor?: (color: { hex: string; label: string }) => string;
}) => (
    <div className="grid grid-cols-8 gap-1">
        {colors.map((color) => (
            <button
                key={color.hex}
                type="button"
                aria-label={labelFor ? labelFor(color) : color.label}
                title={color.label}
                aria-pressed={activeColor === color.hex}
                onMouseDown={preventFocusSteal}
                onClick={() => onPick(color.hex)}
                className="aspect-square rounded-sm border border-border outline-hidden transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-primary"
                style={{ backgroundColor: color.hex }}
            />
        ))}
    </div>
);

/**
 * The labelled hex code field: a swatch of the color being typed, the input,
 * and a one-line hint. Accepts `ff8800`, `#ff8800` and the `#f80` shorthand.
 */
export const HexColorField = ({
    inputLabel,
    value,
    previewColor,
    invalid,
    onChange,
    onCommit,
}: {
    /** Accessible name of the input, e.g. "Custom text color". */
    inputLabel: string;
    value: string;
    /** The valid color shown in the swatch, or `null` for an empty swatch. */
    previewColor: string | null;
    invalid: boolean;
    onChange: (value: string) => void;
    onCommit: () => void;
}) => {
    const hintId = useId();
    return (
        <PickerSection title="Hex code">
            <div className="flex items-center gap-1.5">
                <span
                    aria-hidden
                    className="size-7 shrink-0 rounded-sm border border-border"
                    style={{
                        backgroundColor: previewColor ?? 'transparent',
                        backgroundImage: previewColor
                            ? undefined
                            : 'linear-gradient(to top right, transparent calc(50% - 1px), var(--color-destructive) 50%, transparent calc(50% + 1px))',
                    }}
                />
                <input
                    aria-label={inputLabel}
                    aria-describedby={hintId}
                    aria-invalid={invalid || undefined}
                    value={value}
                    placeholder="#ff8800"
                    spellCheck={false}
                    autoComplete="off"
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            onCommit();
                        }
                    }}
                    className="h-7 min-w-0 flex-1 rounded-sm border border-input bg-background px-2 font-mono text-xs outline-hidden focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive"
                />
            </div>
            <p id={hintId} className={cn('text-[0.6rem] leading-snug', invalid ? 'text-destructive' : 'text-muted-foreground')}>
                {invalid ? 'Use 3 or 6 hex digits, like #f80 or #ff8800.' : 'Type or paste a code.'}
            </p>
        </PickerSection>
    );
};
