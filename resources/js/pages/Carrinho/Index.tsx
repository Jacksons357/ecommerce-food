import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  CreditCard,
  LogIn,
  Clock
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart-store';
import { type SharedData } from '@/types';

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

interface Carrinho {
  id: number;
  items: CarrinhoItem[];
  total: number;
  quantidade_total: number;
}



interface Props {
  carrinho?: Carrinho;
}

export default function CarrinhoIndex({ carrinho }: Props) {
  const page = usePage<SharedData>();
  const { auth } = page.props;
  const { cartItems, removeFromCart, updateQuantity, clearCart, refreshCart } = useCart();
  const [observacoes, setObservacoes] = useState('');
  const [isFinalizando, setIsFinalizando] = useState(false);

  // Atualizar carrinho quando a página carregar
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Type guard para verificar se é CarrinhoItem
  const isCarrinhoItem = (item: CarrinhoItem | CartItem): item is CarrinhoItem => {
    return 'produto' in item;
  };

  // Usar dados do carrinho autenticado ou do localStorage
  const items = auth?.user ? (carrinho?.items || []) : cartItems;
  const total = auth?.user ? (carrinho?.total || 0) : cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const quantidadeTotal = auth?.user ? (carrinho?.quantidade_total || 0) : cartItems.reduce((sum, item) => sum + item.quantidade, 0);

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
    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;

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
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              {items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={limparCarrinho}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Carrinho
                </Button>
              )}
            </motion.div>

            {items.length === 0 ? (
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
                      onClick={() => router.visit('/')}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold"
                    >
                      Ver Cardápio
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de Itens */}
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
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="flex items-center space-x-4 p-4 border-2 border-orange-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <img
                              src={isCarrinhoItem(item) ? item.produto.imagem : item.imagem}
                              alt={isCarrinhoItem(item) ? item.produto.nome : item.nome}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-orange-200"
                            />
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-orange-800">
                                {isCarrinhoItem(item) ? item.produto.nome : item.nome}
                              </h3>
                              {isCarrinhoItem(item) && (
                                <p className="text-orange-600 text-sm line-clamp-2">
                                  {item.produto.descricao}
                                </p>
                              )}
                              <p className="text-orange-600 font-semibold mt-1">
                                R$ {(isCarrinhoItem(item) ? Number(item.preco_unitario) : Number(item.preco)).toFixed(2).replace('.', ',')}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                disabled={item.quantidade <= 1}
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-12 text-center font-semibold text-orange-800">
                                {item.quantidade}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-lg text-orange-600">
                                R$ {(item.quantidade * (isCarrinhoItem(item) ? item.preco_unitario : Number(item.preco))).toFixed(2).replace('.', ',')}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
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

                {/* Resumo do Pedido */}
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
                        {/* Detalhes do Pedido */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-orange-600">Subtotal ({quantidadeTotal} itens):</span>
                            <span className="font-semibold text-orange-800">
                              R$ {Number(total).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-orange-600">Taxa de entrega:</span>
                            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Grátis</Badge>
                          </div>
                          <hr className="border-orange-200" />
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-orange-800">Total:</span>
                            <span className="text-2xl font-bold text-orange-600">
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
                              className="bg-white border-orange-300 text-orange-800 focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                        )}

                        {/* Botão de Finalizar */}
                        {auth?.user ? (
                          <Button
                            onClick={finalizarPedido}
                            disabled={isFinalizando}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold py-3"
                            size="lg"
                          >
                            {isFinalizando ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                Finalizando...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Finalizar Pedido
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.visit('/login')}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold py-3"
                            size="lg"
                          >
                            <LogIn className="h-5 w-5 mr-2" />
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
                        <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-600 mb-1">
                                {auth?.user ? 'Pedido em Preparação' : 'Login Necessário'}
                              </p>
                              <p className="text-sm text-blue-600">
                                {auth?.user 
                                  ? 'Seu pedido será preparado assim que confirmarmos o pagamento.'
                                  : 'Faça login para finalizar seu pedido e acompanhar o status.'
                                }
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