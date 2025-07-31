import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Flame } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';
import { Carousel } from '@/components/ui/carousel';
import { banners } from '@/config/banners';

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
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();

  // Filtrar produtos em destaque
  const produtosDestaque = produtos.filter(produto => produto.destaque_dia);
  const produtosGerais = produtos.filter(produto => !produto.destaque_dia);

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

  return (
    <AppLayout>
      <Head title="Home" />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Hero Section com Carrossel */}
        <section className="mb-8">
          <Carousel
            items={banners}
            height="h-[300px] md:h-[400px] lg:h-[500px]"
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
          <section className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame className="h-8 w-8 text-orange-500" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Destaques do Dia</h2>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Produtos especiais selecionados especialmente para você hoje!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produtosDestaque.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Card className="h-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                    <div className="relative">
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                        <Star className="h-4 w-4 mr-1" />
                        Destaque do Dia
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-gray-800">{produto.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {produto.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-600">
                          R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                        </span>
                        <Button
                          size="default"
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-white font-semibold cursor-pointer"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isLoading ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Seção de Produtos Gerais */}
        <section id="produtos" className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Nosso Cardápio</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Descubra nossos deliciosos produtos preparados com ingredientes frescos e muito amor
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosGerais.map((produto, index) => (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                  <div className="relative">
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-gray-800">{produto.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {produto.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-600">
                        R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => adicionarAoCarrinho(produto)}
                        disabled={isLoading}
                        className="bg-orange-600 hover:bg-orange-700 transition-all duration-300 cursor-pointer"
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
        </section>
      </div>
    </AppLayout>
  );
} 