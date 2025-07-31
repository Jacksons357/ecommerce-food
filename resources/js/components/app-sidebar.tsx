import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Package, ShoppingBag, Settings } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Adiciona itens específicos para admin
    if (auth?.isAdmin) {
        mainNavItems.push(
            {
                title: 'Gerenciar Produtos',
                href: '/admin/produtos',
                icon: Package,
            },

        );
    } else {
        // Adiciona itens para clientes
        mainNavItems.push(
            {
                title: 'Meus Pedidos',
                href: '/pedidos',
                icon: ShoppingBag,
            },
            {
                title: 'Configurações',
                href: '/settings',
                icon: Settings,
            }
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
