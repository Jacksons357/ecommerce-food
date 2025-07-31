import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Edit, Package, Plus, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Produto {
    id: number;
    nome: string;
    preco: number;
    ativo: boolean;
    destaque_dia: boolean;
    created_at: string;
}

interface Pedido {
    id: number;
    status: string;
    total: number;
    created_at: string;
    items_count: number;
}

interface Props {
    isAdmin: boolean;
    stats?: {
        total_produtos: number;
        total_pedidos: number;
        pedidos_pendentes: number;
        faturamento_total: number;
    };
    produtos?: Produto[];
    pedidos?: Pedido[];
}

export default function Dashboard({ isAdmin, produtos, pedidos }: Props) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'preparando':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'pronto':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'entregue':
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return <Clock className="h-4 w-4" />;
            case 'preparando':
                return <AlertCircle className="h-4 w-4" />;
            case 'pronto':
                return <CheckCircle className="h-4 w-4" />;
            case 'entregue':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-100">{isAdmin ? 'Painel Administrativo' : 'Meu Dashboard'}</h1>
                        <p className="mt-1 text-neutral-300">
                            {isAdmin ? 'Gerencie produtos, pedidos e visualize estatísticas' : 'Acompanhe seus pedidos e explore nossos produtos'}
                        </p>
                    </div>

                    {isAdmin && (
                        <Button onClick={() => router.visit('/admin/produtos/create')} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Produto
                        </Button>
                    )}
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-transparent">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Pedidos Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(pedidos || []).length > 0 ? (
                                        pedidos?.map((pedido) => (
                                            <div
                                                key={pedido.id}
                                                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="rounded-full bg-slate-700 p-2">{getStatusIcon(pedido.status)}</div>
                                                    <div>
                                                        <p className="font-semibold text-neutral-100">Pedido #{pedido.id}</p>
                                                        <p className="text-sm text-neutral-400">
                                                            {pedido.items_count || 0} itens • {new Date(pedido.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-neutral-100">
                                                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                                                    </p>
                                                    <Badge className={getStatusColor(pedido.status)}>{pedido.status}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-neutral-400">
                                            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-neutral-500" />
                                            <p>Nenhum pedido encontrado</p>
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="mt-4 w-full"
                                    onClick={() => router.visit('/admin/pedidos')}
                                >
                                    Ver Todos os Pedidos
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Products or User Actions */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-transparent">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    {isAdmin ? (
                                        <>
                                            <Package className="mr-2 h-5 w-5" />
                                            Produtos Ativos
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            Ações Rápidas
                                        </>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isAdmin ? (
                                    <div className="space-y-4">
                                        {(produtos || []).length > 0 ? (
                                            produtos?.map((produto) => (
                                                <div
                                                    key={produto.id}
                                                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-neutral-100">{produto.nome}</p>
                                                        <p className="text-sm text-neutral-400">
                                                            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                                                            {produto.ativo ? 'Ativo' : 'Inativo'}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.visit(`/admin/produtos/${produto.id}/edit`)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-neutral-400">
                                                <Package className="mx-auto mb-4 h-12 w-12 text-neutral-500" />
                                                <p>Nenhum produto encontrado</p>
                                            </div>
                                        )}
                                        <Button variant="outline" className="w-full" onClick={() => router.visit('/admin/produtos')}>
                                            Gerenciar Produtos
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={() => router.visit('/')} className="w-full bg-red-700 hover:bg-red-800">
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Ver Cardápio
                                        </Button>
                                        <Button onClick={() => router.visit('/carrinho')} variant="outline" className="w-full">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            Meu Carrinho
                                        </Button>
                                        <Button onClick={() => router.visit('/pedidos')} variant="outline" className="w-full">
                                            <Clock className="mr-2 h-4 w-4" />
                                            Meus Pedidos
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
