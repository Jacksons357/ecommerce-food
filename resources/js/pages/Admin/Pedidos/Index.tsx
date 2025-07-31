import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Package, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pedidos',
        href: '/admin/pedidos',
    },
];

interface PedidoItem {
    id: number;
    quantidade: number;
    preco_unitario: number;
    produto: {
        id: number;
        nome: string;
        imagem: string;
    };
}

interface Usuario {
    id: number;
    name: string;
    email: string;
}

interface Pedido {
    id: number;
    status: string;
    total: number;
    observacoes?: string;
    created_at: string;
    updated_at: string;
    usuario: Usuario;
    items: PedidoItem[];
    items_count: number;
}

interface Props {
    pedidos: Pedido[];
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function AdminPedidosIndex({ pedidos, flash }: Props) {
    const { toast } = useToast();

    // Exibe mensagens flash como toasts
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Sucesso!",
                description: flash.success,
                variant: "success",
            });
        }
        if (flash?.error) {
            toast({
                title: "Erro!",
                description: flash.error,
                variant: "destructive",
            });
        }
        if (flash?.warning) {
            toast({
                title: "Aviso!",
                description: flash.warning,
            });
        }
        if (flash?.info) {
            toast({
                title: "Informação!",
                description: flash.info,
            });
        }
    }, [flash, toast]);
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

    const handleStatusChange = (pedidoId: number, newStatus: string) => {
        router.put(`/admin/pedidos/${pedidoId}/status`, {
            status: newStatus,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administração de Pedidos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-100">Administração de Pedidos</h1>
                        <p className="mt-1 text-neutral-300">
                            Gerencie todos os pedidos do sistema
                        </p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="bg-transparent">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Package className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm text-neutral-400">Total de Pedidos</p>
                                        <p className="text-2xl font-bold text-neutral-100">{pedidos.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-transparent">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-yellow-400" />
                                    <div>
                                        <p className="text-sm text-neutral-400">Pendentes</p>
                                        <p className="text-2xl font-bold text-neutral-100">
                                            {pedidos.filter(p => p.status.toLowerCase() === 'pendente').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-transparent">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm text-neutral-400">Preparando</p>
                                        <p className="text-2xl font-bold text-neutral-100">
                                            {pedidos.filter(p => p.status.toLowerCase() === 'preparando').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-transparent">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <div>
                                        <p className="text-sm text-neutral-400">Entregues</p>
                                        <p className="text-2xl font-bold text-neutral-100">
                                            {pedidos.filter(p => p.status.toLowerCase() === 'entregue').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Pedidos List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardTitle>Lista de Pedidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pedidos.length > 0 ? (
                                    pedidos.map((pedido, index) => (
                                        <motion.div
                                            key={pedido.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="rounded-lg border border-slate-700 bg-slate-800/50 p-6"
                                        >
                                            {/* Header do Pedido */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="rounded-full bg-slate-700 p-2">
                                                        {getStatusIcon(pedido.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-neutral-100">
                                                            Pedido #{pedido.id}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 text-sm text-neutral-400">
                                                            <div className="flex items-center space-x-1">
                                                                <User className="h-4 w-4" />
                                                                <span>{pedido.usuario.name}</span>
                                                            </div>
                                                            <span>•</span>
                                                            <span>{pedido.items_count} itens</span>
                                                            <span>•</span>
                                                            <span>{formatDate(pedido.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-neutral-100">
                                                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                                                    </p>
                                                    <Badge className={getStatusColor(pedido.status)}>
                                                        {pedido.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Itens do Pedido */}
                                            <div className="mb-4">
                                                <h4 className="mb-2 text-sm font-medium text-neutral-300">Itens do Pedido:</h4>
                                                <div className="space-y-2">
                                                    {pedido.items.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between rounded bg-slate-700/50 p-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-10 w-10 rounded bg-slate-600 flex items-center justify-center">
                                                                    <Package className="h-5 w-5 text-neutral-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-neutral-100">{item.produto.nome}</p>
                                                                    <p className="text-sm text-neutral-400">
                                                                        {item.quantidade}x R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-neutral-100">
                                                                    R$ {Number(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Observações */}
                                            {pedido.observacoes && (
                                                <div className="mb-4">
                                                    <h4 className="mb-2 text-sm font-medium text-neutral-300">Observações:</h4>
                                                    <p className="rounded bg-slate-700/50 p-3 text-sm text-neutral-300">
                                                        {pedido.observacoes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Ações */}
                                            <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-neutral-400">Status:</span>
                                                    <Select
                                                        value={pedido.status}
                                                        onValueChange={(value) => handleStatusChange(pedido.id, value)}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pendente">Pendente</SelectItem>
                                                            <SelectItem value="preparando">Preparando</SelectItem>
                                                            <SelectItem value="pronto">Pronto</SelectItem>
                                                            <SelectItem value="entregue">Entregue</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {/* <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(`/pedidos/${pedido.id}`)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver Detalhes
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-neutral-400">
                                        <Package className="mx-auto mb-4 h-16 w-16 text-neutral-500" />
                                        <p className="text-lg">Nenhum pedido encontrado</p>
                                        <p className="text-sm">Os pedidos aparecerão aqui quando forem criados</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
} 