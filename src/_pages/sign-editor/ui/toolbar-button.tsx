import { cn } from '../../../shared/lib';

interface Props
    extends React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > {
    children: React.ReactNode;
    isActive?: boolean;
}

export const ToolbarButton = ({ children, isActive = false, className, ...props }: Props) => (
    <button
        aria-pressed={isActive}
        className={cn(
            'flex justify-center items-center aspect-square min-w-7 rounded-[calc(var(--radius-md)-2px)]',
            'px-2 py-[calc(--spacing(0.85))] text-xs/relaxed font-bold outline-hidden select-none',
            'hover:bg-muted aria-expanded:bg-muted',
            isActive && 'bg-primary/90 text-primary-foreground hover:bg-primary/90',
            className,
        )}
        {...props}
    >
        {children}
    </button>
);
