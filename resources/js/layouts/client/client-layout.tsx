import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { type PropsWithChildren } from 'react';

export default function ClientLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="pt-16 sm:pt-20">{children}</main>
            <Toaster />
        </div>
    );
}
