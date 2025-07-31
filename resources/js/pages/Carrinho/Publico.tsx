import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, LogIn, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CarrinhoPublico() {
    const { 
        items: cartItems, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        total,
        isLoading
    } = useCart();
    
    const [showClearCartDialog, setShowClearCartDialog] = useState(false);
    
    console.log('CarrinhoPublico - Items:', cartItems);
    console.log('CarrinhoPublico - Total:', total);
    console.log('CarrinhoPublico - Loading:', isLoading);

    // Atualizar quantidade
    const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            await removeFromCart(itemId);
            return;
        }
        await updateQuantity(itemId, newQuantity);
    };

    // Remover item
    const handleRemoveItem = async (itemId: number) => {
        await removeFromCart(itemId);
    };

    // Limpar carrinho
    const handleClearCart = async () => {
        await clearCart();
        setShowClearCartDialog(false);
    };

    // Finalizar pedido (redirecionar para login)
    const finalizarPedido = () => {
        router.visit('/login');
    };

    console.log('CarrinhoPublico - Checking cartItems.length:', cartItems.length);
    
    if (cartItems.length === 0) {
        return (
            <AppLayout>
                <Head title="Carrinho" />

                <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="mb-8 flex items-center"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/')}
                                    className="mr-4 text-orange-700 hover:bg-orange-100 hover:text-orange-900"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
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
                                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white py-12 text-center shadow-xl">
                                    <CardContent>
                                        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-orange-400" />
                                        <h3 className="mb-2 text-xl font-semibold text-orange-800">Seu carrinho está vazio</h3>
                                        <p className="mb-6 text-orange-600">Adicione alguns produtos para começar suas compras</p>
                                        <Button
                                            onClick={() => router.visit('/produtos')}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
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
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/')}
                                    className="mr-4 text-orange-700 hover:bg-orange-100 hover:text-orange-900"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar
                                </Button>
                                <h1 className="text-3xl font-bold text-orange-900">Carrinho</h1>
                                <Badge className="ml-3 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                            <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Limpar Carrinho
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Limpar Carrinho</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja limpar o carrinho? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleClearCart}
                                            className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Limpar Carrinho
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Lista de itens */}
                            <div className="lg:col-span-2">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                        <CardHeader className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-red-100">
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
                                                    className="flex items-center space-x-4 rounded-lg border-2 border-orange-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                                                >
                                                    <img
                                                        src={item.imagem || '/placeholder-product.jpg'}
                                                        alt={item.nome}
                                                        className="h-16 w-16 rounded-lg border-2 border-orange-200 object-cover"
                                                    />

                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-orange-800">{item.nome}</h3>
                                                        <p className="font-semibold text-orange-600">
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
                                                            className="w-16 border-orange-300 text-center focus:border-orange-500 focus:ring-orange-500"
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
                                                        <p className="text-lg font-semibold text-orange-600">
                                                            R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                        <CardHeader className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-red-100">
                                            <CardTitle className="flex items-center text-orange-800">
                                                <CreditCard className="mr-2 h-5 w-5" />
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
                                                <Badge className="border-green-500/30 bg-green-500/20 text-green-600">Grátis</Badge>
                                            </div>
                                            <hr className="border-orange-200" />
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span className="text-orange-800">Total:</span>
                                                <span className="text-orange-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                                            </div>

                                            <div className="space-y-3 pt-4">
                                                <Button
                                                    onClick={finalizarPedido}
                                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-3 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                                                            Processando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LogIn className="mr-2 h-5 w-5" />
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

                                            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                                                <div className="text-center text-sm text-blue-600">
                                                    <p className="mb-1 font-medium">Faça login para finalizar seu pedido</p>
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
