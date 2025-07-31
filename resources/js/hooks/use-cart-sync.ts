import { useEffect } from 'react';
import { useCart } from './use-cart';
import { useCartStore } from '@/stores/cart-store';

export function useCartSync() {
  const { syncLocalCart, isAuthenticated, isAdmin } = useCart();
  const { hasItems } = useCartStore();

  useEffect(() => {
    // Sincronizar automaticamente quando usuário fizer login
    if (isAuthenticated && !isAdmin && hasItems()) {
      console.log('Usuário logado, sincronizando carrinho local...');
      syncLocalCart();
    }
  }, [isAuthenticated, isAdmin, hasItems, syncLocalCart]);

  // Limpar carrinho local se for admin
  useEffect(() => {
    if (isAuthenticated && isAdmin && hasItems()) {
      console.log('Admin logado, limpando carrinho local...');
      useCartStore.getState().clearCart();
    }
  }, [isAuthenticated, isAdmin, hasItems]);

  return {
    shouldSync: isAuthenticated && !isAdmin && hasItems(),
    isSyncing: false, // Será controlado pelo mutation
  };
} 