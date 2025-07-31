import { useCart } from '@/hooks/use-cart';
import { useCartSync } from '@/hooks/use-cart-sync';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle } from 'lucide-react';

export function useCartCount() {
    const { count, isLoading } = useCart();
    return { cartCount: count, isLoading };
}

export function CartCounter() {
    const { cartCount, isLoading } = useCartCount();

    if (cartCount === 0) {
        return null;
    }

    return (
        <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
            {isLoading ? '...' : cartCount}
        </Badge>
    );
}

// Componente para sincronizar carrinho após login
export function CartSync() {
    useCartSync(); // Usar o novo hook
    return null; // Componente invisível
}

// Componente de loading overlay para o carrinho
export function CartLoadingOverlay() {
    const { isLoading } = useCartCount();

    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <LoaderCircle className="h-8 w-8 animate-spin text-red-600" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sincronizando carrinho...
                </p>
            </div>
        </div>
    );
}
