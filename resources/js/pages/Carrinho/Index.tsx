import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCart } from '@/hooks/use-cart';
import { useCartSync } from '@/hooks/use-cart-sync';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CreditCard, LogIn, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CarrinhoIndex() {
    const { 
        items, 
        count,
        total,
        isAuthenticated,
        isAdmin,
        updateQuantity, 
        removeFromCart, 
        clearCart,
        syncCartMutation,
        finalizarPedidoMutation
    } = useCart();
    
    console.log('CarrinhoIndex - Items received:', items);
    console.log('CarrinhoIndex - Count:', count);
    console.log('CarrinhoIndex - Total:', total);
    console.log('CarrinhoIndex - isAuthenticated:', isAuthenticated);
    console.log('CarrinhoIndex - isAdmin:', isAdmin);
    
    // Hook para sincronização automática
    useCartSync();
    
    const [observacoes, setObservacoes] = useState('');
    const [showClearCartDialog, setShowClearCartDialog] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    // Mostrar mensagem de sincronização quando necessário
    useEffect(() => {
        if (isAuthenticated && !isAdmin && syncCartMutation.isPending) {
            setSyncMessage('Sincronizando itens do carrinho...');
        } else {
            setSyncMessage('');
        }
    }, [isAuthenticated, isAdmin, syncCartMutation.isPending]);

    // Usar dados do novo sistema
    const quantidadeTotal = count;

    const atualizarQuantidade = async (itemId: number, novaQuantidade: number) => {
        if (novaQuantidade < 1) return;

        if (isAuthenticated && !isAdmin) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch(`/carrinho/quantidade/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        quantidade: novaQuantidade,
                    }),
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Erro ao atualizar quantidade:', response.status);
                    alert('Erro ao atualizar quantidade. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao atualizar quantidade:', error);
                alert('Erro de conexão. Tente novamente.');
            }
        } else {
            // Usuário não autenticado ou admin - usar localStorage
            await updateQuantity(itemId, novaQuantidade);
        }
    };

    const removerItem = async (itemId: number) => {
        if (isAuthenticated && !isAdmin) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch(`/carrinho/item/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Erro ao remover item:', response.status);
                    alert('Erro ao remover item. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao remover item:', error);
                alert('Erro de conexão. Tente novamente.');
            }
        } else {
            // Usuário não autenticado ou admin - usar localStorage
            await removeFromCart(itemId);
        }
    };

    const limparCarrinho = async () => {
        if (isAuthenticated && !isAdmin) {
            // Usuário autenticado - usar API
            try {
                const response = await fetch('/carrinho/limpar', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Erro ao limpar carrinho:', response.status);
                    alert('Erro ao limpar carrinho. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
                alert('Erro de conexão. Tente novamente.');
            }
        } else {
            // Usuário não autenticado ou admin - usar localStorage
            await clearCart();
        }
        setShowClearCartDialog(false);
    };

    const finalizarPedido = async () => {
        if (items.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        if (!isAuthenticated) {
            // Redirecionar para login se não estiver autenticado
            router.visit('/login');
            return;
        }

        if (isAdmin) {
            alert('Administradores não podem finalizar pedidos.');
            return;
        }

        try {
            // Usar a mutation otimizada (que já sincroniza automaticamente)
            const result = await finalizarPedidoMutation.mutateAsync({ observacoes });
            
            if (result.success) {
                console.log('Pedido finalizado com sucesso!');
                
                // Redirecionar com delay para mostrar feedback
                setTimeout(() => {
                    router.visit('/pedidos');
                }, 500);
            } else {
                alert(result.message || 'Erro ao finalizar pedido');
            }
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert(error instanceof Error ? error.message : 'Erro de conexão ao finalizar pedido. Verifique sua conexão e tente novamente.');
        }
    };

    console.log('CarrinhoIndex - Before return, items:', items, 'length:', items.length);

    return (
        <>
            <Head title="Carrinho" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/')}
                                    className="mr-3 text-orange-700 hover:bg-orange-100 hover:text-orange-900 sm:mr-4"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Voltar</span>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-orange-900 sm:text-3xl">Carrinho</h1>
                                    <Badge className="mt-1 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-xs text-white sm:mt-2 sm:text-sm">
                                        {items.length} item{items.length !== 1 ? 's' : ''}
                                    </Badge>
                                    {syncMessage && (
                                        <div className="mt-2 flex items-center text-sm text-blue-600">
                                            <Clock className="mr-1 h-4 w-4 animate-spin" />
                                            {syncMessage}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botão de limpar carrinho */}
                            {items.length > 0 && (
                                <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Limpar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Limpar carrinho</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tem certeza que deseja remover todos os itens do carrinho? Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={limparCarrinho} className="bg-red-600 hover:bg-red-700">
                                                Limpar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </motion.div>

                        {/* Conteúdo do carrinho */}
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-12"
                            >
                                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Carrinho vazio</h3>
                                <p className="text-gray-500 mb-6">Adicione alguns produtos para começar suas compras!</p>
                                <Button
                                    onClick={() => router.visit('/produtos')}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    Ver produtos
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Lista de itens */}
                                <div className="lg:col-span-2">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="space-y-4"
                                    >
                                        {items.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <Card className="overflow-hidden border-orange-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            {/* Imagem do produto */}
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={item.imagem || '/images/logo_burguer.png'}
                                                                    alt={item.nome}
                                                                    className="h-16 w-16 rounded-lg object-cover"
                                                                />
                                                            </div>

                                                            {/* Informações do produto */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium text-gray-900 truncate">
                                                                    {item.nome}
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                    R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                                                                </p>
                                                            </div>

                                                            {/* Controles de quantidade */}
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                                                    className="h-8 w-8 p-0 border-orange-200 text-orange-700 hover:bg-orange-50"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <span className="w-8 text-center text-sm font-medium text-gray-900">
                                                                    {item.quantidade}
                                                                </span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                                                    className="h-8 w-8 p-0 border-orange-200 text-orange-700 hover:bg-orange-50"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            {/* Preço total do item */}
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900">
                                                                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                                                </p>
                                                            </div>

                                                            {/* Botão remover */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removerItem(item.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>

                                {/* Resumo do pedido */}
                                <div className="lg:col-span-1">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        <Card className="border-orange-200 bg-white shadow-sm">
                                            <CardHeader>
                                                <CardTitle className="text-lg text-orange-900">Resumo do Pedido</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Observações */}
                                                <div>
                                                    <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Observações
                                                    </label>
                                                    <Textarea
                                                        id="observacoes"
                                                        value={observacoes}
                                                        onChange={(e) => setObservacoes(e.target.value)}
                                                        placeholder="Alguma observação especial para seu pedido?"
                                                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                                        rows={3}
                                                    />
                                                </div>

                                                {/* Totais */}
                                                <div className="space-y-2 border-t border-gray-200 pt-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Subtotal ({quantidadeTotal} itens):</span>
                                                        <span className="font-medium">R$ {total.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold text-orange-900">
                                                        <span>Total:</span>
                                                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                </div>

                                                {/* Botão finalizar */}
                                                {!isAuthenticated ? (
                                                    <Button
                                                        onClick={() => router.visit('/login')}
                                                        className="w-full bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        <LogIn className="mr-2 h-4 w-4" />
                                                        Fazer login para finalizar
                                                    </Button>
                                                ) : isAdmin ? (
                                                    <Button
                                                        disabled
                                                        className="w-full bg-gray-400 cursor-not-allowed"
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Admins não podem finalizar pedidos
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={finalizarPedido}
                                                        disabled={finalizarPedidoMutation.isPending}
                                                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400"
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        {finalizarPedidoMutation.isPending ? 'Finalizando...' : 'Finalizar Pedido'}
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
