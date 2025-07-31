import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user ? user.avatar : ''} alt={user ? user.name : ''} />
                <AvatarFallback className="rounded-lg bg-slate-700 text-neutral-100">{getInitials(user ? user.name : '')}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-neutral-100">{user ? user.name : ''}</span>
                {showEmail && <span className="truncate text-xs text-neutral-400">{user ? user.email : ''}</span>}
            </div>
        </>
    );
}
