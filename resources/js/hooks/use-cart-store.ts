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

    // Configurar auth no store quando mudar
    useEffect(() => {
        const userType = auth?.user?.tipo_usuario;
        
        console.log('Auth mudou:', auth?.user?.name, 'Tipo:', userType);
        cartStore.setAuth(auth);
        setIsInitialized(true);
    }, [auth?.user?.id, auth?.user?.tipo_usuario]); // Só executar quando o usuário ou tipo mudar

    // Inscrever para mudanças no carrinho (apenas uma vez)
    useEffect(() => {
        const unsubscribe = cartStore.subscribe((cartItems, cartCount, loading) => {
            // Reduzir logs para evitar spam
            if (cartItems.length > 0 || loading) {
                console.log('CartStore atualizado:', { items: cartItems.length, count: cartCount, loading });
            }
            setItems(cartItems);
            setCount(cartCount);
            setTotal(cartItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0));
            setIsLoading(loading);
        });

        return unsubscribe;
    }, []); // Executar apenas uma vez

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
