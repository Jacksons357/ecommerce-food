import { useEffect, useRef } from 'react';
import { useCart } from './use-cart';
import { useCartStore } from '@/stores/cart-store';

export function useCartSync() {
  const { syncLocalCart, isAuthenticated, isAdmin } = useCart();
  const { hasItems } = useCartStore();
  const hasSyncedRef = useRef(false);
  const syncAttemptsRef = useRef(0);

  useEffect(() => {
    // Sincronizar automaticamente quando usuário fizer login (apenas uma vez)
    if (isAuthenticated && !isAdmin && hasItems() && !hasSyncedRef.current && syncAttemptsRef.current < 3) {
      console.log('Usuário logado, sincronizando carrinho local...');
      hasSyncedRef.current = true;
      syncAttemptsRef.current++;
      
      // Aguardar um pouco para garantir que a sessão esteja estabelecida
      setTimeout(() => {
        syncLocalCart().catch((error) => {
          console.error('Erro na sincronização:', error);
          // Se falhar, resetar para tentar novamente
          hasSyncedRef.current = false;
        });
      }, 1000); // Aumentado para 1 segundo
    }
  }, [isAuthenticated, isAdmin, hasItems, syncLocalCart]);

  // Reset sync flag quando usuário deslogar
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
      syncAttemptsRef.current = 0;
    }
  }, [isAuthenticated]);

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