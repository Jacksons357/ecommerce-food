import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel } from '@/components/ui/carousel';
import { banners } from '@/config/banners';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Flame, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import type { SharedData } from '@/types';

interface Produto {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    imagem: string;
    destaque_dia: boolean;
    ativo: boolean;
}

interface Props {
    produtos: Produto[];
}

export default function Home({ produtos }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const isAdmin = auth?.user?.tipo_usuario === 'admin';
    
    const [loadingProducts, setLoadingProducts] = useState<Set<number>>(new Set());
    const { addToCart } = useCart();
    const { toast } = useToast();

    // Filtrar produtos em destaque
    const produtosDestaque = produtos.filter((produto) => produto.destaque_dia);
    const produtosGerais = produtos.filter((produto) => !produto.destaque_dia);

    const adicionarAoCarrinho = async (produto: Produto) => {
        // Adicionar produto ao loading
        setLoadingProducts(prev => new Set(prev).add(produto.id));
        
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
        } finally {
            // Remover produto do loading
            setLoadingProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(produto.id);
                return newSet;
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Home" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                {/* Hero Section com Carrossel */}
                <section className="mb-4 sm:mb-6 lg:mb-8">
                    <Carousel
                        items={banners}
                        height="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] xl:h-[500px]"
                        autoPlay={true}
                        autoPlayInterval={6000}
                        showControls={true}
                        showIndicators={true}
                        showPlayPause={true}
                        className="w-full"
                    />
                </section>

                {/* Seção de Produtos em Destaque */}
                {produtosDestaque.length > 0 && (
                    <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8 text-center sm:mb-12"
                        >
                            <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
                                <Flame className="h-6 w-6 text-orange-500 sm:h-8 sm:w-8" />
                                <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">Destaques do Dia</h2>
                                <Flame className="h-6 w-6 text-orange-500 sm:h-8 sm:w-8" />
                            </div>
                            <p className="mx-auto max-w-2xl px-4 text-base text-gray-600 sm:text-lg">
                                Produtos especiais selecionados especialmente para você hoje!
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                            {produtosDestaque.map((produto, index) => (
                                <motion.div
                                    key={produto.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                >
                                    <Card className="h-full overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl transition-all duration-300 hover:shadow-2xl">
                                        <div className="relative">
                                            <img
                                                src={produto.imagem}
                                                alt={produto.nome}
                                                className="h-40 w-full object-cover sm:h-48 md:h-56"
                                                loading="lazy"
                                            />
                                            <Badge className="absolute top-2 right-2 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-xs text-white sm:top-3 sm:right-3 sm:text-sm">
                                                <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">Destaque do Dia</span>
                                                <span className="sm:hidden">Destaque</span>
                                            </Badge>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                        <CardHeader className="px-3 pb-2 sm:px-4">
                                            <CardTitle className="line-clamp-2 text-lg text-gray-800 sm:text-xl">{produto.nome}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
                                            <p className="mb-3 line-clamp-3 text-sm text-gray-600 sm:mb-4">{produto.descricao}</p>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                                                <span className="text-xl font-bold text-orange-600 sm:text-2xl">
                                                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                </span>
                                                {!isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => adicionarAoCarrinho(produto)}
                                                        disabled={loadingProducts.has(produto.id)}
                                                        className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700 sm:w-auto"
                                                    >
                                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                                        {loadingProducts.has(produto.id) ? 'Adicionando...' : 'Adicionar'}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Seção de Produtos Gerais */}
                <section id="produtos" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 text-center sm:mb-12"
                    >
                        <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl md:text-4xl">Nosso Cardápio</h2>
                        <p className="mx-auto max-w-2xl px-4 text-base text-gray-600 sm:text-lg">
                            Descubra nossos deliciosos produtos preparados com ingredientes frescos e muito amor
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {produtosGerais.map((produto, index) => (
                            <motion.div
                                key={produto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="h-full overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="relative">
                                        <img
                                            src={produto.imagem}
                                            alt={produto.nome}
                                            className="h-32 w-full object-cover sm:h-40 md:h-48"
                                            loading="lazy"
                                        />
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
                                            {!isAdmin && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => adicionarAoCarrinho(produto)}
                                                    disabled={loadingProducts.has(produto.id)}
                                                    className="w-full cursor-pointer bg-orange-600 transition-all duration-300 hover:bg-orange-700 sm:w-auto"
                                                >
                                                    <ShoppingCart className="mr-1 h-4 w-4" />
                                                    {loadingProducts.has(produto.id) ? 'Adicionando...' : 'Adicionar'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
