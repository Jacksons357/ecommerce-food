import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  produto_id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem?: string;
  produto_id?: number; // Para compatibilidade com API
}

interface CartStore {
  // Estado
  items: CartItem[];
  isLoading: boolean;
  
  // Ações
  addItem: (produto: Produto, quantidade?: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantidade: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getCount: () => number;
  getTotal: () => number;
  hasItems: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
        // Estado inicial
        items: [],
        isLoading: false,

      // Ações
      addItem: (produto: Produto, quantidade = 1) => {
        console.log('Zustand addItem called:', { produto, quantidade });
        set((state) => {
          console.log('Zustand current state before update:', state);
          const existingItem = state.items.find(item => item.produto_id === produto.id);
          
          if (existingItem) {
            console.log('Updating existing item quantity');
            // Atualizar quantidade se item já existe
            const newState = {
              items: state.items.map(item =>
                item.produto_id === produto.id
                  ? { ...item, quantidade: item.quantidade + quantidade }
                  : item
              )
            };
            console.log('Zustand new state after update:', newState);
            return newState;
          } else {
            console.log('Adding new item to cart');
            // Adicionar novo item
            const newItem: CartItem = {
              id: Date.now(), // ID temporário para localStorage
              produto_id: produto.id,
              nome: produto.nome,
              preco: produto.preco,
              quantidade,
              imagem: produto.imagem,
            };
            const newState = { items: [...state.items, newItem] };
            console.log('Zustand new state after add:', newState);
            return newState;
          }
        });
        
        // Verificar se os dados foram persistidos
        setTimeout(() => {
          const currentState = get();
          console.log('Zustand state after persistence check:', currentState);
        }, 100);
      },

      removeItem: (itemId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },

      updateQuantity: (itemId: number, quantidade: number) => {
        if (quantidade <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantidade } : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setItems: (items: CartItem[]) => {
        set({ items });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      // Computed
      getCount: () => {
        return get().items.reduce((total, item) => total + item.quantidade, 0);
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
      },

      hasItems: () => {
        return get().items.length > 0;
      },
    }),
    {
      name: 'cart-storage', // nome da chave no localStorage
      partialize: (state) => ({ items: state.items }), // só persistir items
      onRehydrateStorage: () => (state) => {
        console.log('Zustand rehydrated:', state);
        if (state) {
          console.log('Zustand rehydrated items:', state.items);
        }
      },
    }
  )
); 