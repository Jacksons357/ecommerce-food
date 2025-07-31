import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cartStore } from '@/stores/cartStore';

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