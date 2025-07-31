import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoadingOverlay() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        // Adiciona listeners para eventos do Inertia
        document.addEventListener('inertia:start', handleStart);
        document.addEventListener('inertia:finish', handleFinish);
        document.addEventListener('inertia:error', handleFinish);

        return () => {
            document.removeEventListener('inertia:start', handleStart);
            document.removeEventListener('inertia:finish', handleFinish);
            document.removeEventListener('inertia:error', handleFinish);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-slate-800 p-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-red-600" />
                <p className="text-sm text-neutral-300">Carregando...</p>
            </div>
        </div>
    );
} 