import { cn } from '@/lib/utils';
import { LucideIcon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const tabs: { icon: LucideIcon; label: string }[] = [{ icon: Sun, label: 'Tema Padrão' }];

    return (
        <div className={cn('inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1', className)} {...props}>
            {tabs.map(({ icon: Icon, label }) => (
                <button
                    key={label}
                    disabled
                    className={cn(
                        'flex cursor-not-allowed items-center rounded-md bg-slate-700 px-3.5 py-1.5 text-neutral-100 opacity-50 transition-colors',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
