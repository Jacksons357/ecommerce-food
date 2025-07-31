interface CartItem {
    id: number;
    produto_id: number;
    nome: string;
    preco: number;
    quantidade: number;
    imagem?: string;
}

interface Produto {
    id: number;
    nome: string;
    preco: number;
    imagem?: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    tipo_usuario: string;
}

type CartListener = (items: CartItem[], count: number) => void;

class CartStore {
    private static instance: CartStore;
    private items: CartItem[] = [];
    private listeners: CartListener[] = [];
    private auth: { user?: AuthUser } | null = null;
    private _isInitialized = false;

    private constructor() {
        this.loadFromLocalStorage();
    }

    public static getInstance(): CartStore {
        if (!CartStore.instance) {
            CartStore.instance = new CartStore();
        }
        return CartStore.instance;
    }

    public setAuth(auth: { user?: AuthUser } | null) {
        const wasAuthenticated = this.auth?.user;
        const isNowAuthenticated = auth?.user;
        
        this.auth = auth;
        
        // Se o usuário acabou de fazer login, sincronizar localStorage com banco
        if (!wasAuthenticated && isNowAuthenticated) {
            this.syncLocalStorageToAPI();
        } else if (isNowAuthenticated) {
            // Se já estava autenticado, apenas carregar do banco
            this.loadFromAPI();
        } else {
            // Se não está autenticado, carregar do localStorage
            this.loadFromLocalStorage();
        }
        
        this._isInitialized = true;
    }

    public subscribe(listener: CartListener): () => void {
        this.listeners.push(listener);
        // Call immediately with current state
        listener(this.items, this.calculateCount());
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners() {
        const count = this.calculateCount();
        this.listeners.forEach(listener => listener(this.items, count));
    }

    private calculateCount(): number {
        return this.items.reduce((total, item) => total + item.quantidade, 0);
    }

    private loadFromLocalStorage() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho do localStorage:', error);
            this.items = [];
        }
    }

    private saveToLocalStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Erro ao salvar carrinho no localStorage:', error);
        }
    }

    private async loadFromAPI() {
        try {
            const response = await fetch('/api/cart-data');
            if (response.ok) {
                const data = await response.json();
                this.items = data.items || [];
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho da API:', error);
        }
    }

    private async syncLocalStorageToAPI() {
        const localItems = this.items;
        
        if (localItems.length === 0) {
            // Se não há itens no localStorage, apenas carregar do banco
            await this.loadFromAPI();
            return;
        }

        try {
                            const response = await fetch('/carrinho/sincronizar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ items: localItems }),
                });

            if (response.ok) {
                const data = await response.json();
                this.items = data.carrinho?.items?.map((item: { id: number; produto_id: number; produto: { nome: string; imagem?: string }; preco_unitario: number; quantidade: number }) => ({
                    id: item.id,
                    produto_id: item.produto_id,
                    nome: item.produto.nome,
                    preco: item.preco_unitario,
                    quantidade: item.quantidade,
                    imagem: item.produto.imagem,
                })) || [];
                
                // Limpar localStorage após sincronização bem-sucedida
                localStorage.removeItem('cart');
                this.notifyListeners();
            } else {
                // Se falhar, manter itens do localStorage
                console.error('Erro ao sincronizar carrinho:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao sincronizar carrinho:', error);
            // Em caso de erro, manter itens do localStorage
        }
    }



    public async addToCart(produto: Produto, quantidade: number = 1): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch('/carrinho/adicionar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        produto_id: produto.id,
                        quantidade: quantidade,
                    }),
                });

                if (response.ok) {
                    await this.loadFromAPI();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao adicionar ao carrinho');
                }
            } catch (error) {
                console.error('Erro ao adicionar ao carrinho:', error);
                throw error;
            }
        } else {
            // Usuário não autenticado - usar localStorage
            const existingItem = this.items.find(item => item.produto_id === produto.id);
            
            if (existingItem) {
                this.items = this.items.map(item =>
                    item.produto_id === produto.id
                        ? { ...item, quantidade: item.quantidade + quantidade }
                        : item
                );
            } else {
                const newItem: CartItem = {
                    id: Date.now(),
                    produto_id: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: quantidade,
                    imagem: produto.imagem,
                };
                this.items = [...this.items, newItem];
            }
            
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    public async removeFromCart(itemId: number): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch(`/carrinho/item/${itemId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao remover item do carrinho');
                }
            } catch (error) {
                console.error('Erro ao remover do carrinho:', error);
                throw error;
            }
        } else {
            // Usuário não autenticado - usar localStorage
            this.items = this.items.filter(item => item.id !== itemId);
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    public async updateQuantity(itemId: number, quantidade: number): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch(`/carrinho/quantidade/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantidade }),
                });

                if (response.ok) {
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao atualizar quantidade');
                }
            } catch (error) {
                console.error('Erro ao atualizar quantidade:', error);
                throw error;
            }
        } else {
            // Usuário não autenticado - usar localStorage
            this.items = this.items.map(item =>
                item.id === itemId ? { ...item, quantidade } : item
            );
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    public async clearCart(): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch('/carrinho/limpar', {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao limpar carrinho');
                }
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
                throw error;
            }
        } else {
            // Usuário não autenticado - usar localStorage
            this.items = [];
            localStorage.removeItem('cart');
            this.notifyListeners();
        }
    }

    public getItems(): CartItem[] {
        return [...this.items];
    }

    public getCount(): number {
        return this.calculateCount();
    }

    public getTotal(): number {
        return this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    }

    public isInitialized(): boolean {
        return this._isInitialized;
    }
}

export const cartStore = CartStore.getInstance();
export type { CartItem, Produto, AuthUser }; 