import { cartStore } from '@/stores/cartStore';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle } from 'lucide-react';

export function useCartCount() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [cartCount, setCartCount] = useState(0);
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

        // Inscrever para mudanças no contador e loading
        const unsubscribe = cartStore.subscribe((items, count, loading) => {
            console.log('CartStore atualizado:', { items: items.length, count, loading });
            setCartCount(count);
            setIsLoading(loading);
        });

        return unsubscribe;
    }, [auth, isInitialized]);

    return { cartCount, isLoading };
}

export function CartCounter() {
    const { cartCount, isLoading } = useCartCount();

    if (cartCount === 0) {
        return null;
    }

    return (
        <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
            {isLoading ? '...' : cartCount}
        </Badge>
    );
}

// Componente para sincronizar carrinho após login
export function CartSync() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [lastAuthState, setLastAuthState] = useState<boolean>(false);
    const [hasSynced, setHasSynced] = useState<boolean>(false);

    useEffect(() => {
        const isAuthenticated = !!auth?.user;
        
        // Se o usuário acabou de fazer login (não estava autenticado antes, mas agora está)
        if (!lastAuthState && isAuthenticated && !hasSynced) {
            console.log('Usuário fez login, forçando sincronização do carrinho...');
            
            // Verificar se há itens no localStorage antes da sincronização
            const hasLocalItems = cartStore.hasLocalItems();
            
            // Aguardar um pouco para garantir que a sessão foi estabelecida
            setTimeout(async () => {
                try {
                    if (hasLocalItems) {
                        console.log('Há itens no localStorage, sincronizando...');
                        const hasItems = await cartStore.forceSync();
                        
                        if (hasItems) {
                            console.log('Redirecionando para o carrinho após sincronização...');
                            // Redirecionar para o carrinho se há itens
                            window.location.href = '/carrinho';
                        }
                    } else {
                        console.log('Nenhum item no localStorage, apenas carregando do banco...');
                        await cartStore.forceRefresh();
                    }
                    
                    setHasSynced(true);
                    console.log('Sincronização concluída');
                } catch (error) {
                    console.error('Erro na sincronização forçada:', error);
                    setHasSynced(true);
                }
            }, 1000);
        }
        
        setLastAuthState(isAuthenticated);
    }, [auth?.user, lastAuthState, hasSynced]);

    return null; // Componente invisível
}

// Componente de loading overlay para o carrinho
export function CartLoadingOverlay() {
    const { isLoading } = useCartCount();

    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <LoaderCircle className="h-8 w-8 animate-spin text-red-600" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sincronizando carrinho...
                </p>
            </div>
        </div>
    );
}
