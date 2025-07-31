import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cartStore, type CartItem, type Produto } from '@/stores/cartStore';

export function useCart() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const authRef = useRef(auth);

    useEffect(() => {
        // Só atualizar se o auth realmente mudou
        if (JSON.stringify(authRef.current) !== JSON.stringify(auth)) {
            authRef.current = auth;
            cartStore.setAuth(auth);
        }
    }, [auth]);

    useEffect(() => {
        // Inscrever para mudanças no carrinho
        const unsubscribe = cartStore.subscribe((items, count) => {
            setCartItems(items);
            setCartCount(count);
        });

        // Cleanup na desmontagem
        return unsubscribe;
    }, []); // Removido auth da dependência para evitar re-subscrições

    const addToCart = useCallback(async (produto: Produto, quantidade: number = 1) => {
        setIsLoading(true);
        try {
            await cartStore.addToCart(produto, quantidade);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeFromCart = useCallback(async (itemId: number) => {
        setIsLoading(true);
        try {
            await cartStore.removeFromCart(itemId);
        } catch (error) {
            console.error('Erro ao remover do carrinho:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateQuantity = useCallback(async (itemId: number, quantidade: number) => {
        setIsLoading(true);
        try {
            await cartStore.updateQuantity(itemId, quantidade);
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearCart = useCallback(async () => {
        setIsLoading(true);
        try {
            await cartStore.clearCart();
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshCart = useCallback(async () => {
        await cartStore.forceRefresh();
    }, []);

    return {
        cartItems,
        cartCount,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
    };
} 