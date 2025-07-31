import { motion } from 'framer-motion';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Star, Search, Grid, List, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  destaque_dia: boolean;
  ativo: boolean;
  categoria?: string;
}

interface Props {
  produtos: Produto[];
}

export default function ProdutosIndex({ produtos }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();

  const adicionarAoCarrinho = async (produto: Produto) => {
    try {
      await addToCart(produto, 1);
      toast({
        title: "Sucesso!",
        description: "Produto adicionado ao carrinho!",
        variant: "success",
      });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar ao carrinho. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Filtrar e ordenar produtos
  const filteredProdutos = produtos
    .filter(produto => 
      produto.ativo && 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'todos' || produto.categoria === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'preco_menor':
          return a.preco - b.preco;
        case 'preco_maior':
          return b.preco - a.preco;
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'destaque':
          return b.destaque_dia ? 1 : -1;
        default:
          return 0;
      }
    });

  const categorias = ['todos', ...Array.from(new Set(produtos.map(p => p.categoria).filter((c): c is string => Boolean(c))))];

  return (
    <AppLayout>
      <Head title="Produtos" />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nosso Cardápio</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Descubra nossos deliciosos produtos preparados com ingredientes frescos
                </p>
              </div>
              
              <Button 
                onClick={() => router.visit('/carrinho')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold cursor-pointer w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Carrinho
              </Button>
            </div>

            {/* Busca - Sempre visível */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-orange-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Filtros - Botão toggle para mobile */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden border-orange-200 text-gray-700 hover:bg-orange-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              {/* Controles de visualização - Sempre visíveis */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-gray-700 hover:bg-orange-50'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-gray-700 hover:bg-orange-50'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtros - Desktop sempre visível, mobile toggle */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white border-orange-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria === 'todos' ? 'Todas as Categorias' : categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white border-orange-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome">Nome</SelectItem>
                    <SelectItem value="preco_menor">Menor Preço</SelectItem>
                    <SelectItem value="preco_maior">Maior Preço</SelectItem>
                    <SelectItem value="destaque">Destaques</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Resultados */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''} encontrado{filteredProdutos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid de Produtos */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                    <div className="relative">
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="w-full h-32 sm:h-40 md:h-48 object-cover"
                        loading="lazy"
                      />
                      {produto.destaque_dia && (
                        <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs sm:text-sm">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Destaque</span>
                          <span className="sm:hidden">★</span>
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <CardHeader className="pb-2 px-3 sm:px-4">
                      <CardTitle className="text-base sm:text-lg text-gray-800 line-clamp-2">{produto.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                      <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
                        {produto.descricao}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <span className="text-lg sm:text-xl font-bold text-orange-600">
                          R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold cursor-pointer w-full sm:w-auto"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {isLoading ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Lista de Produtos */
            <div className="space-y-3 sm:space-y-4">
              {filteredProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <Card className="bg-gradient-to-r from-orange-50 to-white border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-2">{produto.nome}</h3>
                            {produto.destaque_dia && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs w-fit">
                                <Star className="h-3 w-3 mr-1" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {produto.descricao}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <p className="text-lg sm:text-xl font-bold text-orange-600 text-center sm:text-right">
                            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                          </p>
                          <Button
                            onClick={() => adicionarAoCarrinho(produto)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold cursor-pointer w-full sm:w-auto"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {isLoading ? 'Adicionando...' : 'Adicionar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mensagem quando não há produtos */}
          {filteredProdutos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <Search className="h-12 w-12 sm:h-16 sm:w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('todos');
                  setSortBy('nome');
                }}
                variant="outline"
                className="border-orange-200 text-gray-700 hover:bg-orange-50"
              >
                Limpar Filtros
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 