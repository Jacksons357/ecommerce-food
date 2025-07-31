import { useCartStore } from '@/hooks/use-cart-store';
import { cartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CartDebug() {
    const { items, count, total, isLoading, isInitialized, forceSync, forceRefresh, hasLocalItems } = useCartStore();

    const handleForceSync = async () => {
        console.log('Forçando sincronização...');
        const hasItems = await forceSync();
        console.log('Sincronização concluída, tem itens:', hasItems);
    };

    const handleForceRefresh = async () => {
        console.log('Forçando refresh...');
        await forceRefresh();
        console.log('Refresh concluído');
    };

    const handleAddTestItem = () => {
        const testItem = {
            id: Date.now(),
            nome: 'Produto Teste',
            preco: 10.99,
            imagem: undefined,
        };
        cartStore.addToCart(testItem, 1);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Debug do Carrinho
                    <Badge variant={isInitialized ? 'default' : 'secondary'}>
                        {isInitialized ? 'Inicializado' : 'Não Inicializado'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Itens:</span>
                        <Badge variant="outline">{items.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Quantidade Total:</span>
                        <Badge variant="outline">{count}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Total:</span>
                        <Badge variant="outline">R$ {total.toFixed(2)}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Loading:</span>
                        <Badge variant={isLoading ? 'destructive' : 'default'}>
                            {isLoading ? 'Sim' : 'Não'}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Local Items:</span>
                        <Badge variant={hasLocalItems() ? 'destructive' : 'default'}>
                            {hasLocalItems() ? 'Sim' : 'Não'}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-2">
                    <Button onClick={handleForceSync} disabled={isLoading} className="w-full">
                        Forçar Sincronização
                    </Button>
                    <Button onClick={handleForceRefresh} disabled={isLoading} variant="outline" className="w-full">
                        Forçar Refresh
                    </Button>
                    <Button onClick={handleAddTestItem} disabled={isLoading} variant="secondary" className="w-full">
                        Adicionar Item Teste
                    </Button>
                </div>

                {items.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Itens no Carrinho:</h4>
                        <div className="space-y-1">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.nome}</span>
                                    <span>Qtd: {item.quantidade}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
