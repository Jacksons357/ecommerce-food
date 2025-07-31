import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { CartSync, CartLoadingOverlay } from '@/components/cart-counter';
import { type PropsWithChildren } from 'react';

export default function ClientLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <CartSync />
            <CartLoadingOverlay />
            <Navbar />
            <main className="pt-16 sm:pt-16">{children}</main>
            <Toaster />
        </div>
    );
}
