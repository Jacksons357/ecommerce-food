import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingCart, ArrowLeft, Plus, Minus, CreditCard, LogIn } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/hooks/use-cart-store';

// Interface removida pois não está sendo usada

export default function CarrinhoPublico() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [loading] = useState(false);

    // Carregar carrinho do localStorage
    useEffect(() => {
        // O contexto já carrega automaticamente
    }, []);

    // Atualizar quantidade
    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        updateQuantity(itemId, newQuantity);
    };

    // Remover item
    const handleRemoveItem = (itemId: number) => {
        removeFromCart(itemId);
    };

    // Limpar carrinho
    const handleClearCart = () => {
        clearCart();
    };

    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    // Finalizar pedido (redirecionar para login)
    const finalizarPedido = () => {
        router.visit('/login');
    };

    if (cartItems.length === 0) {
        return (
            <AppLayout>
                <Head title="Carrinho" />
                
                <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex items-center mb-8"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/')}
                                    className="mr-4 text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                                <h1 className="text-3xl font-bold text-orange-900">Carrinho</h1>
                            </motion.div>

                            {/* Carrinho vazio */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="text-center py-12 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                    <CardContent>
                                        <ShoppingCart className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-orange-800 mb-2">
                                            Seu carrinho está vazio
                                        </h3>
                                        <p className="text-orange-600 mb-6">
                                            Adicione alguns produtos para começar suas compras
                                        </p>
                                        <Button
                                            onClick={() => router.visit('/produtos')}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold"
                                        >
                                            Ver Produtos
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Carrinho" />
            
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center justify-between mb-8"
                        >
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/')}
                                    className="mr-4 text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                                <h1 className="text-3xl font-bold text-orange-900">Carrinho</h1>
                                <Badge className="ml-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleClearCart}
                                className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Limpar Carrinho
                            </Button>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Lista de itens */}
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
                                            <CardTitle className="text-orange-800">Itens do Carrinho</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-6">
                                            {cartItems.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    whileHover={{ x: 5 }}
                                                    className="flex items-center space-x-4 p-4 border-2 border-orange-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
                                                >
                                                    <img
                                                        src={item.imagem || '/placeholder-product.jpg'}
                                                        alt={item.nome}
                                                        className="w-16 h-16 object-cover rounded-lg border-2 border-orange-200"
                                                    />
                                                    
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-orange-800">{item.nome}</h3>
                                                        <p className="text-orange-600 font-semibold">
                                                            R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantidade - 1)}
                                                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        
                                                        <Input
                                                            type="number"
                                                            value={item.quantidade}
                                                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-16 text-center border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                                                            
                                                            min="1"
                                                        />
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantidade + 1)}
                                                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-lg text-orange-600">
                                                            R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Resumo do pedido */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="sticky top-8"
                                >
                                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
                                            <CardTitle className="flex items-center text-orange-800">
                                                <CreditCard className="h-5 w-5 mr-2" />
                                                Resumo do Pedido
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-6">
                                            <div className="flex justify-between">
                                                <span className="text-orange-600">Subtotal:</span>
                                                <span className="font-semibold text-orange-800">R$ {total.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-orange-600">Taxa de entrega:</span>
                                                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Grátis</Badge>
                                            </div>
                                            <hr className="border-orange-200" />
                                            <div className="flex justify-between font-semibold text-lg">
                                                <span className="text-orange-800">Total:</span>
                                                <span className="text-orange-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                                            </div>

                                            <div className="space-y-3 pt-4">
                                                <Button
                                                    onClick={finalizarPedido}
                                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold py-3"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                                            Processando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LogIn className="h-5 w-5 mr-2" />
                                                            Fazer Login para Finalizar
                                                        </>
                                                    )}
                                                </Button>
                                                
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.visit('/produtos')}
                                                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                                >
                                                    Continuar Comprando
                                                </Button>
                                            </div>

                                            <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-4 mt-4">
                                                <div className="text-sm text-blue-600 text-center">
                                                    <p className="font-medium mb-1">Faça login para finalizar seu pedido</p>
                                                    <p>e acompanhar o status da entrega</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 