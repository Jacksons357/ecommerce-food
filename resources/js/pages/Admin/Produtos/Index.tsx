import { motion } from 'framer-motion';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Eye,
  Package,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  destaque_dia: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  produtos: Produto[];
}

export default function AdminProdutosIndex({ produtos }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [localProdutos, setLocalProdutos] = useState<Produto[]>(produtos);
  const { toast } = useToast();

  const filteredProdutos = localProdutos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDestaque = async (produtoId: number) => {
    try {
      const response = await fetch(`/admin/produtos/${produtoId}/destaque`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        // Atualiza localmente sem recarregar a página
        setLocalProdutos(prevProdutos =>
          prevProdutos.map(produto =>
            produto.id === produtoId
              ? { ...produto, destaque_dia: !produto.destaque_dia }
              : produto
          )
        );
        
        toast({
          title: "Destaque atualizado",
          description: "O destaque do produto foi alterado com sucesso.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar destaque:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar o destaque do produto.",
        variant: "destructive",
      });
    }
  };

  const deletarProduto = async (produto: Produto) => {
    setIsDeleting(produto.id);

    try {
      const response = await fetch(`/admin/produtos/${produto.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove o produto da lista local sem recarregar a página
        setLocalProdutos(prevProdutos =>
          prevProdutos.filter(p => p.id !== produto.id)
        );
        
        toast({
          title: "Produto excluído",
          description: `O produto "${produto.nome}" foi excluído com sucesso.`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o produto.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <AppLayout>
      <Head title="Administração - Produtos" />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">Gerenciar Produtos</h1>
              <p className="text-neutral-400">Gerencie todos os produtos do cardápio</p>
            </div>
            <Button
              onClick={() => router.visit('/admin/produtos/create')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {/* Barra de pesquisa */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-neutral-100"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProdutos.map((produto, index) => (
            <motion.div
              key={produto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all bg-transparent">
                <div className="relative">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {produto.destaque_dia && (
                      <Badge className="bg-orange-500">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    <Badge variant={produto.ativo ? "default" : "secondary"}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{produto.nome}</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {produto.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-orange-600">
                      R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.visit(`/admin/produtos/${produto.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.visit(`/admin/produtos/${produto.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDestaque(produto.id)}
                      className={produto.destaque_dia ? 'bg-orange-100 text-orange-700' : ''}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{produto.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletarProduto(produto)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting === produto.id}
                          >
                            {isDeleting === produto.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Excluindo...
                              </>
                            ) : (
                              'Excluir'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProdutos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro produto'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.visit('/admin/produtos/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
} 