import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart-store';

export function CartDebug() {
    const { cartItems, cartCount, isLoading, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

    const testProduct = {
        id: 1,
        nome: 'Produto Teste',
        preco: 10.5,
        imagem: '/images/banners/capa1.png',
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Debug do Carrinho
                    <Badge variant="secondary">{cartCount} itens</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Button onClick={() => addToCart(testProduct, 1)} disabled={isLoading} size="sm" className="w-full">
                        {isLoading ? 'Adicionando...' : 'Adicionar Produto Teste'}
                    </Button>

                    <Button onClick={() => clearCart()} disabled={isLoading} size="sm" variant="destructive" className="w-full">
                        {isLoading ? 'Limpando...' : 'Limpar Carrinho'}
                    </Button>
                </div>

                <div className="space-y-2">
                    <h4 className="font-medium">Itens no Carrinho:</h4>
                    {cartItems.length === 0 ? (
                        <p className="text-sm text-neutral-400">Carrinho vazio</p>
                    ) : (
                        <div className="space-y-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/50 p-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-100">{item.nome}</p>
                                        <p className="text-sm text-neutral-400">
                                            R$ {Number(item.preco).toFixed(2)} x {item.quantidade}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantidade - 1))}
                                            disabled={isLoading}
                                        >
                                            -
                                        </Button>
                                        <span className="w-8 text-center">{item.quantidade}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                                            disabled={isLoading}
                                        >
                                            +
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)} disabled={isLoading}>
                                            X
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-700 pt-2">
                    <p className="text-sm text-neutral-100">
                        <strong>Total:</strong> R$ {cartItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0).toFixed(2)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
