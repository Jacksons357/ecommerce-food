import { getCSRFToken } from '@/lib/csrf';

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

type CartListener = (items: CartItem[], count: number, isLoading: boolean) => void;

class CartStore {
    private static instance: CartStore;
    private items: CartItem[] = [];
    private listeners: CartListener[] = [];
    private auth: { user?: AuthUser } | null = null;
    private _isInitialized = false;
    private lastApiCall = 0;
    private apiCacheTimeout = 5000; // 5 segundos de cache
    private pendingApiCall: Promise<void> | null = null;
    private isLoading = false;
    private syncPromise: Promise<boolean> | null = null;

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
        const isNowAdmin = auth?.user?.tipo_usuario === 'admin';

        // Evitar processamento desnecessário se o auth não mudou
        if (this.auth?.user?.id === auth?.user?.id && this.auth?.user?.tipo_usuario === auth?.user?.tipo_usuario) {
            return;
        }

        this.auth = auth;

        // Se o usuário acabou de fazer login
        if (!wasAuthenticated && isNowAuthenticated) {
            console.log('Usuário fez login, sincronizando carrinho...');
            
            // Se é cliente, sincronizar localStorage com banco
            if (!isNowAdmin) {
                // Carregar do banco primeiro, depois sincronizar
                this.loadFromAPI().then(() => {
                    this.syncLocalStorageToAPI();
                });
            } else {
                // Se é admin, limpar carrinho do localStorage
                console.log('Admin logado, limpando carrinho do localStorage');
                localStorage.removeItem('cart');
                this.items = [];
                this.notifyListeners();
            }
        } else if (isNowAuthenticated && !this._isInitialized) {
            // Se já estava autenticado mas não foi inicializado
            if (!isNowAdmin) {
                console.log('Usuário cliente já autenticado, carregando carrinho do banco...');
                this.loadFromAPI();
            } else {
                console.log('Admin já autenticado, carrinho vazio');
                this.items = [];
                this.notifyListeners();
            }
        } else if (!isNowAuthenticated) {
            // Se não está autenticado, carregar do localStorage
            console.log('Usuário não autenticado, carregando carrinho do localStorage...');
            this.loadFromLocalStorage();
        }

        this._isInitialized = true;
    }

    public subscribe(listener: CartListener): () => void {
        this.listeners.push(listener);
        // Call immediately with current state
        listener(this.items, this.calculateCount(), this.isLoading);

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
        // Usar setTimeout para evitar loops infinitos
        setTimeout(() => {
            this.listeners.forEach((listener) => listener(this.items, count, this.isLoading));
        }, 0);
    }

    private setLoading(loading: boolean) {
        this.isLoading = loading;
        this.notifyListeners();
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

    private async loadFromAPI(): Promise<void> {
        // Verificar se já existe uma requisição pendente
        if (this.pendingApiCall) {
            return this.pendingApiCall;
        }

        // Verificar cache (5 segundos)
        const now = Date.now();
        if (now - this.lastApiCall < this.apiCacheTimeout) {
            return;
        }

        // Criar nova requisição
        this.pendingApiCall = this._loadFromAPI();
        this.lastApiCall = now;

        try {
            await this.pendingApiCall;
        } finally {
            this.pendingApiCall = null;
        }
    }

    private async _loadFromAPI(): Promise<void> {
        this.setLoading(true);
        try {
            const response = await fetch('/api/cart-data');
            if (response.ok) {
                const data = await response.json();
                this.items = data.items || [];
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho da API:', error);
        } finally {
            this.setLoading(false);
        }
    }

    // Método síncrono para sincronização - retorna Promise<boolean> indicando se há itens
    public async syncLocalStorageToAPI(): Promise<boolean> {
        // Se já existe uma sincronização em andamento, aguardar
        if (this.syncPromise) {
            return this.syncPromise;
        }

        this.syncPromise = this._syncLocalStorageToAPI();
        try {
            return await this.syncPromise;
        } finally {
            this.syncPromise = null;
        }
    }

    private async _syncLocalStorageToAPI(): Promise<boolean> {
        const localItems = this.items;

        console.log('Iniciando sincronização do localStorage com API...', localItems);

        if (localItems.length === 0) {
            // Se não há itens no localStorage, apenas carregar do banco
            console.log('Nenhum item no localStorage, carregando do banco...');
            await this.loadFromAPI();
            return this.items.length > 0;
        }

        this.setLoading(true);
        try {
            console.log('Enviando itens para sincronização:', localItems);
                            const response = await fetch('/carrinho/sincronizar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCSRFToken(),
                    },
                    body: JSON.stringify({ items: localItems }),
                });

            if (response.ok) {
                const data = await response.json();
                console.log('Sincronização bem-sucedida:', data);
                
                // Mesclar itens do banco com itens do localStorage
                const serverItems = data.carrinho?.items?.map(
                    (item: {
                        id: number;
                        produto_id: number;
                        produto: { nome: string; imagem?: string };
                        preco_unitario: number;
                        quantidade: number;
                    }) => ({
                        id: item.id,
                        produto_id: item.produto_id,
                        nome: item.produto.nome,
                        preco: item.preco_unitario,
                        quantidade: item.quantidade,
                        imagem: item.produto.imagem,
                    }),
                ) || [];

                // Combinar itens do servidor com itens locais (evitando duplicatas)
                const combinedItems = [...serverItems];
                
                // Adicionar itens locais que não existem no servidor
                localItems.forEach(localItem => {
                    const existsInServer = serverItems.some(serverItem => 
                        serverItem.produto_id === localItem.produto_id
                    );
                    if (!existsInServer) {
                        combinedItems.push(localItem);
                    }
                });

                this.items = combinedItems;

                // Limpar localStorage após sincronização bem-sucedida
                localStorage.removeItem('cart');
                console.log('localStorage limpo após sincronização');
                this.notifyListeners();
                return this.items.length > 0;
            } else {
                // Se falhar, manter itens do localStorage
                const errorText = await response.text();
                console.error('Erro ao sincronizar carrinho:', response.status, errorText);
                return localItems.length > 0;
            }
        } catch (error) {
            console.error('Erro ao sincronizar carrinho:', error);
            // Em caso de erro, manter itens do localStorage
            return localItems.length > 0;
        } finally {
            this.setLoading(false);
        }
    }

    public async addToCart(produto: Produto, quantidade: number = 1): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            this.setLoading(true);
            try {
                const response = await fetch('/carrinho/adicionar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCSRFToken(),
                    },
                    body: JSON.stringify({
                        produto_id: produto.id,
                        quantidade: quantidade,
                    }),
                });

                if (response.ok) {
                    // Invalidar cache e recarregar
                    this.lastApiCall = 0;
                    await this.loadFromAPI();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao adicionar ao carrinho');
                }
            } catch (error) {
                console.error('Erro ao adicionar ao carrinho:', error);
                throw error;
            } finally {
                this.setLoading(false);
            }
        } else {
            // Usuário não autenticado - usar localStorage
            const existingItem = this.items.find((item) => item.produto_id === produto.id);

            if (existingItem) {
                this.items = this.items.map((item) =>
                    item.produto_id === produto.id ? { ...item, quantidade: item.quantidade + quantidade } : item,
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
            this.setLoading(true);
            try {
                const response = await fetch(`/carrinho/item/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': getCSRFToken(),
                    },
                });

                if (response.ok) {
                    // Invalidar cache e recarregar
                    this.lastApiCall = 0;
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao remover item do carrinho');
                }
            } catch (error) {
                console.error('Erro ao remover do carrinho:', error);
                throw error;
            } finally {
                this.setLoading(false);
            }
        } else {
            // Usuário não autenticado - usar localStorage
            this.items = this.items.filter((item) => item.id !== itemId);
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    public async updateQuantity(itemId: number, quantidade: number): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            this.setLoading(true);
            try {
                const response = await fetch(`/carrinho/quantidade/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCSRFToken(),
                    },
                    body: JSON.stringify({ quantidade }),
                });

                if (response.ok) {
                    // Invalidar cache e recarregar
                    this.lastApiCall = 0;
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao atualizar quantidade');
                }
            } catch (error) {
                console.error('Erro ao atualizar quantidade:', error);
                throw error;
            } finally {
                this.setLoading(false);
            }
        } else {
            // Usuário não autenticado - usar localStorage
            this.items = this.items.map((item) => (item.id === itemId ? { ...item, quantidade } : item));
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }

    public async clearCart(): Promise<void> {
        if (this.auth?.user) {
            // Usuário autenticado - usar API
            this.setLoading(true);
            try {
                const response = await fetch('/carrinho/limpar', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': getCSRFToken(),
                    },
                });

                if (response.ok) {
                    // Invalidar cache e recarregar
                    this.lastApiCall = 0;
                    await this.loadFromAPI();
                } else {
                    throw new Error('Erro ao limpar carrinho');
                }
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
                throw error;
            } finally {
                this.setLoading(false);
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
        return this.items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
    }

    public isInitialized(): boolean {
        return this._isInitialized;
    }

    public getIsLoading(): boolean {
        return this.isLoading;
    }

    // Método para forçar refresh do cache (útil para sincronização manual)
    public async forceRefresh(): Promise<void> {
        this.lastApiCall = 0;
        await this.loadFromAPI();
    }

    // Método para forçar sincronização do localStorage com API
    public async forceSync(): Promise<boolean> {
        if (this.auth?.user) {
            return await this.syncLocalStorageToAPI();
        }
        return false;
    }

    // Método para verificar se há itens no localStorage
    public hasLocalItems(): boolean {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const cartItems = JSON.parse(savedCart);
                return cartItems.length > 0;
            }
        } catch (error) {
            console.error('Erro ao verificar localStorage:', error);
        }
        return false;
    }
}

export const cartStore = CartStore.getInstance();
export type { AuthUser, CartItem, Produto };
