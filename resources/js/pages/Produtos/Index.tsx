import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

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
                title: 'Sucesso!',
                description: 'Produto adicionado ao carrinho!',
                variant: 'success',
            });
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao adicionar ao carrinho. Tente novamente.',
                variant: 'destructive',
            });
        }
    };

    // Filtrar e ordenar produtos
    const filteredProdutos = produtos
        .filter(
            (produto) =>
                produto.ativo &&
                produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (selectedCategory === 'todos' || produto.categoria === selectedCategory),
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

    const categorias = ['todos', ...Array.from(new Set(produtos.map((p) => p.categoria).filter((c): c is string => Boolean(c))))];

    return (
        <AppLayout>
            <Head title="Produtos" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Nosso Cardápio</h1>
                                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                    Descubra nossos deliciosos produtos preparados com ingredientes frescos
                                </p>
                            </div>

                            <Button
                                onClick={() => router.visit('/carrinho')}
                                className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700 sm:w-auto"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Ver Carrinho
                            </Button>
                        </div>

                        {/* Busca - Sempre visível */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Buscar produtos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-orange-200 bg-white pl-10 text-gray-800 focus:border-orange-500 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Filtros - Botão toggle para mobile */}
                        <div className="mb-4 flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="border-orange-200 text-gray-700 hover:bg-orange-50 md:hidden"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filtros
                            </Button>

                            {/* Controles de visualização - Sempre visíveis */}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={
                                        viewMode === 'grid'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'border-orange-200 text-gray-700 hover:bg-orange-50'
                                    }
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={
                                        viewMode === 'list'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'border-orange-200 text-gray-700 hover:bg-orange-50'
                                    }
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Filtros - Desktop sempre visível, mobile toggle */}
                        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="border-orange-200 bg-white text-gray-800 focus:border-orange-500 focus:ring-orange-500">
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((categoria) => (
                                            <SelectItem key={categoria} value={categoria}>
                                                {categoria === 'todos' ? 'Todas as Categorias' : categoria}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="border-orange-200 bg-white text-gray-800 focus:border-orange-500 focus:ring-orange-500">
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
                        <p className="text-sm text-gray-600 sm:text-base">
                            {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''} encontrado
                            {filteredProdutos.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Grid de Produtos */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProdutos.map((produto, index) => (
                                <motion.div
                                    key={produto.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                >
                                    <Card className="h-full overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl transition-all duration-300 hover:shadow-2xl">
                                        <div className="relative">
                                            <img
                                                src={produto.imagem}
                                                alt={produto.nome}
                                                className="h-32 w-full object-cover sm:h-40 md:h-48"
                                                loading="lazy"
                                            />
                                            {produto.destaque_dia && (
                                                <Badge className="absolute top-2 right-2 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-xs text-white sm:top-3 sm:right-3 sm:text-sm">
                                                    <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Destaque</span>
                                                    <span className="sm:hidden">★</span>
                                                </Badge>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                        <CardHeader className="px-3 pb-2 sm:px-4">
                                            <CardTitle className="line-clamp-2 text-base text-gray-800 sm:text-lg">{produto.nome}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
                                            <p className="mb-3 line-clamp-2 text-sm text-gray-600 sm:mb-4">{produto.descricao}</p>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                                                <span className="text-lg font-bold text-orange-600 sm:text-xl">
                                                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => adicionarAoCarrinho(produto)}
                                                    disabled={isLoading}
                                                    className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700 sm:w-auto"
                                                >
                                                    <ShoppingCart className="mr-1 h-4 w-4" />
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
                                    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                <img
                                                    src={produto.imagem}
                                                    alt={produto.nome}
                                                    className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                                        <h3 className="line-clamp-2 text-base font-semibold text-gray-800 sm:text-lg">
                                                            {produto.nome}
                                                        </h3>
                                                        {produto.destaque_dia && (
                                                            <Badge className="w-fit border-0 bg-gradient-to-r from-orange-500 to-red-500 text-xs text-white">
                                                                <Star className="mr-1 h-3 w-3" />
                                                                Destaque
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="line-clamp-2 text-sm text-gray-600">{produto.descricao}</p>
                                                </div>

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                                    <p className="text-center text-lg font-bold text-orange-600 sm:text-right sm:text-xl">
                                                        R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                    </p>
                                                    <Button
                                                        onClick={() => adicionarAoCarrinho(produto)}
                                                        disabled={isLoading}
                                                        className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700 sm:w-auto"
                                                    >
                                                        <ShoppingCart className="mr-1 h-4 w-4" />
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center sm:py-12">
                            <Search className="mx-auto mb-4 h-12 w-12 text-orange-400 sm:h-16 sm:w-16" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">Nenhum produto encontrado</h3>
                            <p className="mb-6 text-sm text-gray-600 sm:text-base">Tente ajustar os filtros ou buscar por outro termo</p>
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
