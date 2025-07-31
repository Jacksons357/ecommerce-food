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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { refreshCSRFToken } from '@/lib/csrf';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Edit, Eye, Package, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

    const filteredProdutos = localProdutos.filter(
        (produto) =>
            produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const toggleDestaque = async (produtoId: number) => {
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Toggle attempt ${attempt}/${maxRetries}`);
                
                // Recarregar token CSRF a cada tentativa
                let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (!csrfToken || attempt > 1) {
                    console.log('Recarregando token CSRF...');
                    csrfToken = await refreshCSRFToken();
                }
                
                console.log('CSRF Token for toggle:', csrfToken);
                
                const response = await fetch(`/admin/produtos/${produtoId}/destaque`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    credentials: 'same-origin',
                });

                console.log(`Toggle attempt ${attempt} response status:`, response.status);

                if (response.status === 419) {
                    console.warn('CSRF token expirado, recarregando...');
                    await refreshCSRFToken();
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                        continue;
                    }
                }

                if (response.ok) {
                    // Atualiza localmente sem recarregar a página
                    setLocalProdutos((prevProdutos) =>
                        prevProdutos.map((produto) => (produto.id === produtoId ? { ...produto, destaque_dia: !produto.destaque_dia } : produto)),
                    );

                    toast({
                        title: 'Destaque atualizado',
                        description: 'O destaque do produto foi alterado com sucesso.',
                        variant: 'success',
                    });
                    return; // Sucesso, sair do loop
                } else {
                    // Tentar ler resposta como JSON, se falhar, mostrar texto
                    try {
                        const errorData = await response.json();
                        lastError = new Error(errorData.message || `Erro ${response.status}: Erro ao alterar destaque`);
                    } catch {
                        const errorText = await response.text();
                        console.error('Error response text:', errorText);
                        lastError = new Error(`Erro ${response.status}: Erro ao alterar destaque`);
                    }
                }
            } catch (error) {
                console.error(`Toggle attempt ${attempt} failed:`, error);
                lastError = error as Error;
            }

            if (attempt < maxRetries) {
                // Aguardar antes da próxima tentativa (backoff exponencial)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        // Se chegou aqui, todas as tentativas falharam
        console.error('Toggle failed after all attempts:', lastError);
        toast({
            title: 'Erro',
            description: lastError?.message || 'Erro de conexão ao alterar o destaque. Verifique sua conexão e tente novamente.',
            variant: 'destructive',
        });
    };

    const deletarProduto = async (produto: Produto) => {
        setIsDeleting(produto.id);

        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Delete attempt ${attempt}/${maxRetries}`);
                
                // Recarregar token CSRF a cada tentativa
                let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (!csrfToken || attempt > 1) {
                    console.log('Recarregando token CSRF...');
                    csrfToken = await refreshCSRFToken();
                }
                
                console.log('CSRF Token for delete:', csrfToken);
                
                const response = await fetch(`/admin/produtos/${produto.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin',
                });

                console.log(`Delete attempt ${attempt} response status:`, response.status);

                if (response.status === 419) {
                    console.warn('CSRF token expirado, recarregando...');
                    await refreshCSRFToken();
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                        continue;
                    }
                }

                if (response.ok) {
                    // Remove o produto da lista local sem recarregar a página
                    setLocalProdutos((prevProdutos) => prevProdutos.filter((p) => p.id !== produto.id));

                    toast({
                        title: 'Produto excluído',
                        description: `O produto "${produto.nome}" foi excluído com sucesso.`,
                        variant: 'success',
                    });
                    return; // Sucesso, sair do loop
                } else {
                    // Tentar ler resposta como JSON, se falhar, mostrar texto
                    try {
                        const errorData = await response.json();
                        lastError = new Error(errorData.message || `Erro ${response.status}: Erro ao excluir produto`);
                    } catch {
                        const errorText = await response.text();
                        console.error('Error response text:', errorText);
                        lastError = new Error(`Erro ${response.status}: Erro ao excluir produto`);
                    }
                }
            } catch (error) {
                console.error(`Delete attempt ${attempt} failed:`, error);
                lastError = error as Error;
            }

            if (attempt < maxRetries) {
                // Aguardar antes da próxima tentativa (backoff exponencial)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        // Se chegou aqui, todas as tentativas falharam
        console.error('Delete failed after all attempts:', lastError);
        toast({
            title: 'Erro',
            description: lastError?.message || 'Erro de conexão ao excluir o produto. Verifique sua conexão e tente novamente.',
            variant: 'destructive',
        });
        
        setIsDeleting(null);
    };

    return (
        <AppLayout>
            <Head title="Administração - Produtos" />

            <div className="p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-100">Gerenciar Produtos</h1>
                            <p className="text-neutral-400">Gerencie todos os produtos do cardápio</p>
                        </div>
                        <Button onClick={() => router.visit('/admin/produtos/create')} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Produto
                        </Button>
                    </div>

                    {/* Barra de pesquisa */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-neutral-100"
                        />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProdutos.map((produto, index) => (
                        <motion.div
                            key={produto.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="h-full overflow-hidden bg-transparent shadow-lg transition-all hover:shadow-xl">
                                <div className="relative">
                                    <img src={produto.imagem} alt={produto.nome} className="h-48 w-full object-cover" />
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        {produto.destaque_dia && (
                                            <Badge className="bg-orange-500">
                                                <Star className="mr-1 h-3 w-3" />
                                                Destaque
                                            </Badge>
                                        )}
                                        <Badge variant={produto.ativo ? 'default' : 'secondary'}>{produto.ativo ? 'Ativo' : 'Inativo'}</Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="line-clamp-1 text-lg">{produto.nome}</CardTitle>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{produto.descricao}</p>

                                    <div className="mb-4 flex items-center justify-between">
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
                                            <Eye className="mr-1 h-4 w-4" />
                                            Ver
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.visit(`/admin/produtos/${produto.id}/edit`)}
                                            className="flex-1"
                                        >
                                            <Edit className="mr-1 h-4 w-4" />
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
                                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja excluir o produto "{produto.nome}"? Esta ação não pode ser desfeita.
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
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-600">
                            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                        </h3>
                        <p className="mb-6 text-gray-500">
                            {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece criando seu primeiro produto'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => router.visit('/admin/produtos/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Primeiro Produto
                            </Button>
                        )}
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
