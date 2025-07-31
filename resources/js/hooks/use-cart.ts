import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore, type CartItem, type Produto } from '@/stores/cart-store';
import { getCSRFToken, refreshCSRFToken } from '@/lib/csrf';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

// Query Keys
export const cartKeys = {
  all: ['cart'] as const,
  details: () => [...cartKeys.all, 'details'] as const,
  count: () => [...cartKeys.all, 'count'] as const,
};

// Tipos
interface CartResponse {
  success: boolean;
  message?: string;
  carrinho?: {
    id: number;
    items: Array<{
      id: number;
      produto_id: number;
      produto: { nome: string; imagem?: string };
      preco_unitario: number;
      quantidade: number;
    }>;
    total: number;
    quantidade_total: number;
  };
  // Formato alternativo direto
  items?: Array<{
    id: number;
    produto_id: number;
    nome: string;
    preco: number;
    quantidade: number;
    imagem?: string;
  }>;
  count?: number;
  total?: number;
}

interface SyncResponse {
  success: boolean;
  message?: string;
  carrinho?: {
    id: number;
    items: Array<{
      id: number;
      produto_id: number;
      produto: { nome: string; imagem?: string };
      preco_unitario: number;
      quantidade: number;
    }>;
  };
}

// API Functions
const fetchCart = async (): Promise<CartResponse> => {
  console.log('fetchCart called');
  const response = await fetch('/api/cart-data');
  console.log('fetchCart response status:', response.status);
  if (!response.ok) {
    throw new Error('Falha ao carregar carrinho');
  }
  const data = await response.json();
  console.log('fetchCart data:', data);
  return data;
};

const addToCartAPI = async (data: { produto_id: number; quantidade: number }): Promise<CartResponse> => {
  console.log('addToCartAPI called with:', data);
  const response = await fetch('/carrinho/adicionar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCSRFToken(),
    },
    body: JSON.stringify(data),
  });
  
  console.log('addToCartAPI response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('addToCartAPI error:', errorData);
    throw new Error(errorData.message || 'Erro ao adicionar ao carrinho');
  }
  
  const result = await response.json();
  console.log('addToCartAPI success:', result);
  return result;
};

const updateQuantity = async ({ itemId, quantidade }: { itemId: number; quantidade: number }): Promise<CartResponse> => {
  const response = await fetch(`/carrinho/quantidade/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCSRFToken(),
    },
    body: JSON.stringify({ quantidade }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao atualizar quantidade');
  }
  
  return response.json();
};

const removeItem = async (itemId: number): Promise<CartResponse> => {
  const response = await fetch(`/carrinho/item/${itemId}`, {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': getCSRFToken(),
    },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao remover item');
  }
  
  return response.json();
};

const clearCart = async (): Promise<CartResponse> => {
  const response = await fetch('/carrinho/limpar', {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': getCSRFToken(),
    },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao limpar carrinho');
  }
  
  return response.json();
};

const syncCart = async (items: CartItem[]): Promise<SyncResponse> => {
  console.log('syncCart called with items:', items);
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`syncCart attempt ${attempt}/${maxRetries}`);
      
      // Recarregar o token CSRF a cada tentativa
      let csrfToken = getCSRFToken();
      if (!csrfToken || attempt > 1) {
        console.warn('Recarregando token CSRF...');
        csrfToken = await refreshCSRFToken();
      }
      
      const response = await fetch('/carrinho/sincronizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ items }),
        credentials: 'same-origin',
      });
      
      console.log(`syncCart attempt ${attempt} response status:`, response.status);
      
      if (response.status === 419) {
        console.warn('CSRF token expirado, recarregando...');
        await refreshCSRFToken();
        // Aguardar um pouco antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`syncCart attempt ${attempt} error response:`, errorText);
        throw new Error(`Erro ao sincronizar carrinho: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`syncCart attempt ${attempt} success response:`, data);
      return data;
      
    } catch (error) {
      console.error(`syncCart attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Aguardar antes da próxima tentativa (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error('syncCart failed after all attempts:', lastError);
  throw lastError || new Error('Falha na sincronização após múltiplas tentativas');
};

// Hooks
export function useCart() {
  const page = usePage<SharedData>();
  const { auth } = page.props;
  const isAuthenticated = !!auth?.user;
  const isAdmin = auth?.user?.tipo_usuario === 'admin';
  
  console.log('useCart - Auth state:', { 
    isAuthenticated, 
    isAdmin, 
    user: auth?.user?.name,
    tipo: auth?.user?.tipo_usuario 
  });
  
  const queryClient = useQueryClient();
  const { items: localItems, setItems, clearCart: clearLocalCart } = useCartStore();
  
  console.log('useCart - Local items from store:', localItems);

  // Query para carregar carrinho do servidor (apenas se autenticado e não admin)
  const {
    data: serverCart,
    isLoading: isLoadingServer,
    error: serverError,
  } = useQuery({
    queryKey: cartKeys.details(),
    queryFn: fetchCart,
    enabled: isAuthenticated && !isAdmin,
    staleTime: 30 * 1000, // 30 segundos
  });

  console.log('Query enabled:', isAuthenticated && !isAdmin);
  console.log('Query loading:', isLoadingServer);
  console.log('Query error:', serverError);

  console.log('useCart - Server cart:', serverCart);
  console.log('useCart - Local items:', localItems);

  // Mutation para adicionar item
  const addItemMutation = useMutation({
    mutationFn: addToCartAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  // Mutation para atualizar quantidade
  const updateQuantityMutation = useMutation({
    mutationFn: updateQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  // Mutation para remover item
  const removeItemMutation = useMutation({
    mutationFn: removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  // Mutation para limpar carrinho
  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // Limpar cache imediatamente
      queryClient.setQueryData(cartKeys.details(), { items: [], count: 0, total: 0 });
    },
  });

  // Mutation para sincronizar carrinho
  const syncCartMutation = useMutation({
    mutationFn: syncCart,
    onSuccess: (data) => {
      // Converter itens do servidor para o formato local
      const serverItems: CartItem[] = data.carrinho?.items?.map(item => ({
        id: item.id,
        produto_id: item.produto_id,
        nome: item.produto.nome,
        preco: item.preco_unitario,
        quantidade: item.quantidade,
        imagem: item.produto.imagem,
      })) || [];
      
      setItems(serverItems);
      clearLocalCart(); // Limpar localStorage após sincronização
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  // Mutation para finalizar pedido
  const finalizarPedidoMutation = useMutation({
    mutationFn: async (data: { observacoes: string }) => {
      // Verificar se há itens locais que precisam ser adicionados ao servidor
      const localItems = useCartStore.getState().items;
      if (isAuthenticated && !isAdmin && localItems.length > 0) {
        console.log('Adicionando itens locais ao servidor antes de finalizar...');
        
        // Adicionar cada item individualmente ao servidor
        for (const item of localItems) {
          try {
            await addItemMutation.mutateAsync({ 
              produto_id: item.produto_id, 
              quantidade: item.quantidade 
            });
            console.log(`Item ${item.nome} adicionado ao servidor`);
          } catch (error) {
            console.error(`Erro ao adicionar item ${item.nome}:`, error);
            // Continuar mesmo com erro
          }
        }
        
        // Aguardar um pouco para garantir que os itens foram processados
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Recarregar token CSRF antes de finalizar
      const csrfToken = await refreshCSRFToken();
      
      const response = await fetch('/pedidos/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao finalizar pedido' }));
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Limpar cache imediatamente
      queryClient.setQueryData(cartKeys.details(), { items: [], count: 0, total: 0 });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // Limpar localStorage também
      clearLocalCart();
    },
  });

  // Determinar quais itens mostrar
  let items: CartItem[] = [];
  
  console.log('useCart - Auth check:', { isAuthenticated, isAdmin });
  console.log('useCart - Server cart check:', { hasServerCart: !!serverCart, hasItems: !!serverCart?.carrinho?.items });
  console.log('useCart - Local items count:', localItems.length);
  console.log('useCart - Local items:', localItems);
  
  // Para usuários não autenticados ou admins, sempre usar itens locais
  if (!isAuthenticated || isAdmin) {
    console.log('useCart - Using local items (not authenticated or admin)');
    items = localItems;
  } else if (serverCart?.items && serverCart.items.length > 0) {
    // Para usuários autenticados (clientes), usar itens do servidor (formato direto da API)
    console.log('useCart - Using server items (direct format from API)');
    items = serverCart.items;
  } else if (serverCart?.carrinho?.items && serverCart.carrinho.items.length > 0) {
    // Fallback para formato carrinho wrapper (se existir)
    console.log('useCart - Using server items (carrinho wrapper format)');
    items = serverCart.carrinho.items.map(item => ({
      id: item.id,
      produto_id: item.produto_id,
      nome: item.produto.nome,
      preco: item.preco_unitario,
      quantidade: item.quantidade,
      imagem: item.produto.imagem,
    }));
  } else {
    // Fallback para itens locais se não houver dados do servidor
    console.log('useCart - Using local items as fallback');
    items = localItems;
  }
  
  console.log('useCart - Final items:', items);

  const isLoading = isLoadingServer || addItemMutation.isPending || 
                   updateQuantityMutation.isPending || removeItemMutation.isPending || 
                   clearCartMutation.isPending || syncCartMutation.isPending || 
                   finalizarPedidoMutation.isPending;

  // Funções para manipular carrinho
  const addToCart = async (produto: Produto, quantidade = 1) => {
    console.log('addToCart called:', { produto, quantidade, isAuthenticated, isAdmin });
    
    // Para usuários não autenticados ou admins, usar localStorage
    if (!isAuthenticated || isAdmin) {
      console.log('Adding to local cart...');
      useCartStore.getState().addItem(produto, quantidade);
      return; // Retorna imediatamente para evitar chamada à API
    }
    
    console.log('Adding to server cart...');
    try {
      await addItemMutation.mutateAsync({ produto_id: produto.id, quantidade });
    } catch (error) {
      console.error('Error adding to server cart:', error);
      // Fallback para localStorage em caso de erro
      console.log('Falling back to local cart due to error');
      useCartStore.getState().addItem(produto, quantidade);
    }
  };

  const updateItemQuantity = async (itemId: number, quantidade: number) => {
    if (isAuthenticated && !isAdmin) {
      await updateQuantityMutation.mutateAsync({ itemId, quantidade });
    } else {
      useCartStore.getState().updateQuantity(itemId, quantidade);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (isAuthenticated && !isAdmin) {
      await removeItemMutation.mutateAsync(itemId);
    } else {
      useCartStore.getState().removeItem(itemId);
    }
  };

  const clearCartItems = async () => {
    if (isAuthenticated && !isAdmin) {
      await clearCartMutation.mutateAsync();
    } else {
      useCartStore.getState().clearCart();
    }
  };

  const syncLocalCart = async () => {
    console.log('syncLocalCart called:', { isAuthenticated, isAdmin, localItemsLength: localItems.length });
    
    if (isAuthenticated && !isAdmin && localItems.length > 0) {
      console.log('syncLocalCart - Starting sync with items:', localItems);
      try {
        await syncCartMutation.mutateAsync(localItems);
        console.log('syncLocalCart - Sync completed successfully');
        // Limpar localStorage apenas após sincronização bem-sucedida
        useCartStore.getState().clearCart();
        return true;
      } catch (error) {
        console.error('syncLocalCart - Sync failed:', error);
        // Não limpar localStorage em caso de erro para não perder os dados
        return false;
      }
    } else {
      console.log('syncLocalCart - Skipping sync (conditions not met)');
      return true; // Considerar sucesso quando não há necessidade de sincronizar
    }
  };

  // Computed values
  const count = items.reduce((total, item) => total + item.quantidade, 0);
  const total = items.reduce((total, item) => total + (item.preco * item.quantidade), 0);

  return {
    // Estado
    items,
    count,
    total,
    isLoading,
    isAuthenticated,
    isAdmin,
    
    // Ações
    addToCart,
    updateQuantity: updateItemQuantity,
    removeFromCart,
    clearCart: clearCartItems,
    syncLocalCart,
    
    // Mutations
    addItemMutation,
    updateQuantityMutation,
    removeItemMutation,
    clearCartMutation,
    syncCartMutation,
    finalizarPedidoMutation,
    
    // Errors
    error: serverError,
  };
} 