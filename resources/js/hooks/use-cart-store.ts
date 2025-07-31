import { cartStore } from '@/stores/cartStore';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { CartItem, Produto } from '@/stores/cartStore';

export function useCartStore() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [items, setItems] = useState<CartItem[]>([]);
    const [count, setCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Configurar auth no store apenas uma vez
        if (!isInitialized) {
            console.log('Inicializando cartStore com auth:', auth?.user?.name);
            cartStore.setAuth(auth);
            setIsInitialized(true);
        } else if (auth?.user && !cartStore.isInitialized()) {
            // Se o auth mudou e o store não foi inicializado, reconfigurar
            console.log('Reconfigurando cartStore após mudança de auth');
            cartStore.setAuth(auth);
        }

        // Inscrever para mudanças no carrinho
        const unsubscribe = cartStore.subscribe((cartItems, cartCount, loading) => {
            console.log('CartStore atualizado:', { items: cartItems.length, count: cartCount, loading });
            setItems(cartItems);
            setCount(cartCount);
            setTotal(cartItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0));
            setIsLoading(loading);
        });

        return unsubscribe;
    }, [auth, isInitialized]);

    const addToCart = async (produto: Produto, quantidade: number = 1) => {
        await cartStore.addToCart(produto, quantidade);
    };

    const removeFromCart = async (itemId: number) => {
        await cartStore.removeFromCart(itemId);
    };

    const updateQuantity = async (itemId: number, quantidade: number) => {
        await cartStore.updateQuantity(itemId, quantidade);
    };

    const clearCart = async () => {
        await cartStore.clearCart();
    };

    const forceSync = async () => {
        return await cartStore.forceSync();
    };

    const forceRefresh = async () => {
        await cartStore.forceRefresh();
    };

    const hasLocalItems = () => {
        return cartStore.hasLocalItems();
    };

    return {
        items,
        count,
        total,
        isLoading,
        isInitialized: isInitialized,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        forceSync,
        forceRefresh,
        hasLocalItems,
    };
}
