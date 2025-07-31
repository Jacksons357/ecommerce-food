import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;

    // Se for admin, usa o layout com sidebar
    if (auth?.isAdmin) {
        return <NavUserWithSidebar />;
    }

    // Se não for admin, usa o layout sem sidebar
    return <NavUserWithoutSidebar />;
}

function NavUserWithSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function NavUserWithoutSidebar() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 cursor-pointer text-neutral-300 hover:text-neutral-100 p-1 sm:p-2">
                    <Avatar className="size-6 sm:size-8 overflow-hidden rounded-full">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="rounded-lg bg-slate-700 text-neutral-100 text-xs sm:text-sm">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{auth.user.name}</span>
                    <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 rounded-lg"
                align="end"
                side="bottom"
            >
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
