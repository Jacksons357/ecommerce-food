import { cn } from '@/lib/utils';
import { LucideIcon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const tabs: { icon: LucideIcon; label: string }[] = [
        { icon: Sun, label: 'Tema Padrão' },
    ];

    return (
        <div className={cn('inline-flex gap-1 rounded-lg bg-slate-800 p-1 border border-slate-700', className)} {...props}>
            {tabs.map(({ icon: Icon, label }) => (
                <button
                    key={label}
                    disabled
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors bg-slate-700 text-neutral-100 opacity-50 cursor-not-allowed',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
