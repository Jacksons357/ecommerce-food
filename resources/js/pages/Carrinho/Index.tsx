import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCart } from '@/hooks/use-cart';
import { useCartSync } from '@/hooks/use-cart-sync';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CreditCard, LogIn, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Produto {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    imagem: string;
}

interface CarrinhoItem {
    id: number;
    quantidade: number;
    preco_unitario: number;
    produto: Produto;
}

interface CartItem {
    id: number;
    produto_id: number;
    nome: string;
    preco: number;
    quantidade: number;
    imagem?: string;
}

export default function CarrinhoIndex() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { 
        items, 
        count,
        total,
        isAuthenticated,
        isAdmin,
        updateQuantity, 
        removeFromCart, 
        clearCart,
        syncCartMutation
    } = useCart();
    
    // Hook para sincronização automática
    useCartSync();
    
    const [observacoes, setObservacoes] = useState('');
    const [isFinalizando, setIsFinalizando] = useState(false);
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

    // Type guard para verificar se é CarrinhoItem
    const isCarrinhoItem = (item: CarrinhoItem | CartItem): item is CarrinhoItem => {
        return 'produto' in item;
    };

    // Usar dados do novo sistema
    const quantidadeTotal = count;

    const atualizarQuantidade = async (itemId: number, novaQuantidade: number) => {
        if (novaQuantidade < 1) return;

        if (auth?.user) {
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
                }
            } catch (error) {
                console.error('Erro ao atualizar quantidade:', error);
            }
        } else {
            // Visitante - usar localStorage
            updateQuantity(itemId, novaQuantidade);
        }
    };

    const removerItem = async (itemId: number) => {
        if (auth?.user) {
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
                }
            } catch (error) {
                console.error('Erro ao remover item:', error);
            }
        } else {
            // Visitante - usar localStorage
            removeFromCart(itemId);
        }
    };

    const limparCarrinho = async () => {
        if (auth?.user) {
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
                }
            } catch (error) {
                console.error('Erro ao limpar carrinho:', error);
            }
        } else {
            // Visitante - usar localStorage
            clearCart();
        }
        setShowClearCartDialog(false);
    };

    const finalizarPedido = async () => {
        if (items.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        if (!auth?.user) {
            // Redirecionar para login se não estiver autenticado
            router.visit('/login');
            return;
        }

        setIsFinalizando(true);

        try {
            const response = await fetch('/pedidos/finalizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    observacoes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Pedido finalizado com sucesso!');
                    router.visit('/pedidos');
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Erro ao finalizar pedido');
            }
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert('Erro ao finalizar pedido');
        } finally {
            setIsFinalizando(false);
        }
    };

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
                            {items.length > 0 && (
                                <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
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
                                                onClick={limparCarrinho}
                                                className="bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Limpar Carrinho
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </motion.div>

                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white py-8 text-center shadow-xl sm:py-12">
                                    <CardContent>
                                        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-orange-400 sm:h-16 sm:w-16" />
                                        <h3 className="mb-2 text-lg font-semibold text-orange-800 sm:text-xl">Seu carrinho está vazio</h3>
                                        <p className="mb-6 text-sm text-orange-600 sm:text-base">
                                            Adicione alguns produtos para começar suas compras
                                        </p>
                                        <Button
                                            onClick={() => router.visit('/')}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
                                        >
                                            Ver Cardápio
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                                {/* Lista de Itens */}
                                <div className="lg:col-span-2">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                            <CardHeader className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-red-100">
                                                <CardTitle className="text-lg text-orange-800 sm:text-xl">Itens do Carrinho</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                                                {items.map((item, index) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        whileHover={{ x: 5 }}
                                                        className="flex flex-col gap-3 rounded-lg border-2 border-orange-200 bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                                                    >
                                                        <img
                                                            src={isCarrinhoItem(item) ? item.produto.imagem : item.imagem}
                                                            alt={isCarrinhoItem(item) ? item.produto.nome : item.nome}
                                                            className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-orange-200 object-cover sm:h-20 sm:w-20"
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="line-clamp-2 text-base font-semibold text-orange-800 sm:text-lg">
                                                                {isCarrinhoItem(item) ? item.produto.nome : item.nome}
                                                            </h3>
                                                            {isCarrinhoItem(item) && (
                                                                <p className="mt-1 line-clamp-2 text-sm text-orange-600">{item.produto.descricao}</p>
                                                            )}
                                                            <p className="mt-1 text-sm font-semibold text-orange-600 sm:text-base">
                                                                R${' '}
                                                                {(isCarrinhoItem(item) ? Number(item.preco_unitario) : Number(item.preco))
                                                                    .toFixed(2)
                                                                    .replace('.', ',')}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                                                    disabled={item.quantidade <= 1}
                                                                    className="h-8 w-8 border-orange-300 p-0 text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>

                                                                <span className="w-8 text-center text-sm font-semibold text-orange-800 sm:w-12 sm:text-base">
                                                                    {item.quantidade}
                                                                </span>

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                                                    className="h-8 w-8 border-orange-300 p-0 text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-base font-bold text-orange-600 sm:text-lg">
                                                                    R${' '}
                                                                    {(
                                                                        item.quantidade *
                                                                        (isCarrinhoItem(item) ? item.preco_unitario : Number(item.preco))
                                                                    )
                                                                        .toFixed(2)
                                                                        .replace('.', ',')}
                                                                </p>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removerItem(item.id)}
                                                                    className="mt-1 h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Resumo do Pedido */}
                                <div className="lg:col-span-1">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className="sticky top-4 sm:top-8"
                                    >
                                        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                            <CardHeader className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-red-100">
                                                <CardTitle className="flex items-center text-lg text-orange-800 sm:text-xl">
                                                    <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Resumo do Pedido
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 p-4 sm:p-6">
                                                {/* Detalhes do Pedido */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm text-orange-600 sm:text-base">
                                                            Subtotal ({quantidadeTotal} itens):
                                                        </span>
                                                        <span className="text-sm font-semibold text-orange-800 sm:text-base">
                                                            R$ {Number(total).toFixed(2).replace('.', ',')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm text-orange-600 sm:text-base">Taxa de entrega:</span>
                                                        <Badge className="border-green-500/30 bg-green-500/20 text-xs text-green-600 sm:text-sm">
                                                            Grátis
                                                        </Badge>
                                                    </div>
                                                    <hr className="border-orange-200" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-base font-bold text-orange-800 sm:text-lg">Total:</span>
                                                        <span className="text-xl font-bold text-orange-600 sm:text-2xl">
                                                            R$ {Number(total).toFixed(2).replace('.', ',')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Observações */}
                                                {auth?.user && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-orange-700">Observações:</label>
                                                        <Textarea
                                                            placeholder="Alguma observação especial para seu pedido?"
                                                            value={observacoes}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacoes(e.target.value)}
                                                            rows={3}
                                                            className="border-orange-300 bg-white text-sm text-orange-800 focus:border-orange-500 focus:ring-orange-500"
                                                        />
                                                    </div>
                                                )}

                                                {/* Botão de Finalizar */}
                                                {auth?.user ? (
                                                    <Button
                                                        onClick={finalizarPedido}
                                                        disabled={isFinalizando}
                                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-3 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
                                                        size="lg"
                                                    >
                                                        {isFinalizando ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white sm:h-5 sm:w-5" />
                                                                Finalizando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                                Finalizar Pedido
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => router.visit('/login')}
                                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-3 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
                                                        size="lg"
                                                    >
                                                        <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                        Fazer Login para Finalizar
                                                    </Button>
                                                )}

                                                {/* Botão Continuar Comprando */}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.visit('/')}
                                                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                                >
                                                    Continuar Comprando
                                                </Button>

                                                {/* Informações Adicionais */}
                                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 sm:p-4">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400 sm:h-5 sm:w-5" />
                                                        <div>
                                                            <p className="mb-1 text-xs font-medium text-blue-600 sm:text-sm">
                                                                {auth?.user ? 'Pedido em Preparação' : 'Login Necessário'}
                                                            </p>
                                                            <p className="text-xs text-blue-600 sm:text-sm">
                                                                {auth?.user
                                                                    ? 'Seu pedido será preparado assim que confirmarmos o pagamento.'
                                                                    : 'Faça login para finalizar seu pedido e acompanhar o status.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
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
