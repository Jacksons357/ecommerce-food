import { cartStore } from '@/stores/cartStore';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function useCartCount() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [cartCount, setCartCount] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Configurar auth no store apenas uma vez
        if (!isInitialized) {
            cartStore.setAuth(auth);
            setIsInitialized(true);
        }

        // Inscrever apenas para mudanças no contador
        const unsubscribe = cartStore.subscribe((items, count) => {
            setCartCount(count);
        });

        return unsubscribe;
    }, [auth, isInitialized]);

    return cartCount;
}

export function CartCounter() {
    const cartCount = useCartCount();

    if (cartCount === 0) {
        return null;
    }

    return (
        <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
            {cartCount}
        </Badge>
    );
}
