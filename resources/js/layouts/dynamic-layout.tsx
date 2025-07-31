import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import AppSidebarLayout from './app/app-sidebar-layout';
import ClientLayout from './client/client-layout';

interface DynamicLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function DynamicLayout({ children, breadcrumbs, ...props }: DynamicLayoutProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    // Debug: Log para verificar se está funcionando
    console.log('DynamicLayout Debug:', {
        isAdmin: auth?.isAdmin,
        user: auth?.user?.name,
        tipo_usuario: auth?.user?.tipo_usuario,
        url: page.url,
    });

    // Se for admin, usa o layout com sidebar
    if (auth?.isAdmin) {
        console.log('Usando AppSidebarLayout');
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppSidebarLayout>
        );
    }

    // Se não for admin ou não estiver autenticado, usa o layout com navbar
    console.log('Usando ClientLayout');
    return <ClientLayout>{children}</ClientLayout>;
}
