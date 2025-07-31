import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore, type CartItem, type Produto } from '@/stores/cart-store';
import { getCSRFToken } from '@/lib/csrf';
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
  const response = await fetch('/carrinho/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCSRFToken(),
    },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao sincronizar carrinho');
  }
  
  return response.json();
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
  } else if (serverCart?.carrinho?.items && serverCart.carrinho.items.length > 0) {
    // Para usuários autenticados (clientes), usar itens do servidor se disponíveis
    console.log('useCart - Using server items (authenticated client)');
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
                   clearCartMutation.isPending || syncCartMutation.isPending;

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
    if (isAuthenticated && !isAdmin && localItems.length > 0) {
      await syncCartMutation.mutateAsync(localItems);
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
    
    // Errors
    error: serverError,
  };
} 