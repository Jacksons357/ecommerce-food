import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';

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

interface Pedido {
    id: number;
    status: string;
    total: number;
    observacoes?: string;
    created_at: string;
    updated_at: string;
    items: PedidoItem[];
}

interface Props {
    pedidos: Pedido[];
}

export default function PedidosIndex({ pedidos }: Props) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
            case 'preparando':
                return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
            case 'pronto':
                return 'bg-green-500/20 text-green-600 border-green-500/30';
            case 'entregue':
                return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
            case 'cancelado':
                return 'bg-red-500/20 text-red-600 border-red-500/30';
            default:
                return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
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
            case 'cancelado':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusDescription = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return 'Seu pedido foi recebido e está aguardando confirmação';
            case 'preparando':
                return 'Seu pedido está sendo preparado com muito carinho';
            case 'pronto':
                return 'Seu pedido está pronto para entrega!';
            case 'entregue':
                return 'Seu pedido foi entregue com sucesso';
            case 'cancelado':
                return 'Seu pedido foi cancelado';
            default:
                return 'Status do pedido não definido';
        }
    };

    return (
        <AppLayout>
            <Head title="Meus Pedidos" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6 sm:mb-8"
                        >
                            <div className="mb-6 text-center sm:mb-8">
                                <h1 className="mb-2 text-2xl font-bold text-orange-900 sm:text-3xl">Meus Pedidos</h1>
                                <p className="text-sm text-orange-600 sm:text-base">Acompanhe o status e histórico de todos os seus pedidos</p>
                            </div>
                        </motion.div>

                        {/* Lista de Pedidos */}
                        <div className="space-y-4 sm:space-y-6">
                            {pedidos.length > 0 ? (
                                pedidos.map((pedido, index) => (
                                    <motion.div
                                        key={pedido.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Card className="overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
                                            <CardHeader className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-red-100 p-4 sm:p-6">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                        <div className="rounded-full bg-orange-200 p-2 shadow-sm">{getStatusIcon(pedido.status)}</div>
                                                        <div>
                                                            <CardTitle className="text-base text-orange-800 sm:text-lg">
                                                                Pedido #{pedido.id}
                                                            </CardTitle>
                                                            <p className="text-xs text-orange-600 sm:text-sm">{formatDate(pedido.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-center sm:text-right">
                                                        <p className="text-xl font-bold text-orange-600 sm:text-2xl">
                                                            R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                                                        </p>
                                                        <Badge className={`${getStatusColor(pedido.status)} mt-1 text-xs sm:text-sm`}>
                                                            {pedido.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-4 sm:p-6">
                                                {/* Status Description */}
                                                <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 sm:mb-6 sm:p-4">
                                                    <p className="text-sm font-medium text-blue-600 sm:text-base">
                                                        {getStatusDescription(pedido.status)}
                                                    </p>
                                                </div>

                                                {/* Items */}
                                                <div className="mb-4 sm:mb-6">
                                                    <h4 className="mb-3 flex items-center text-sm font-semibold text-orange-800 sm:mb-4 sm:text-base">
                                                        <Package className="mr-2 h-4 w-4" />
                                                        Itens do Pedido
                                                    </h4>
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {pedido.items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex flex-col gap-3 rounded-lg border-2 border-orange-200 bg-white p-3 shadow-md transition-all duration-300 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <img
                                                                        src={item.produto.imagem}
                                                                        alt={item.produto.nome}
                                                                        className="h-10 w-10 flex-shrink-0 rounded-lg border-2 border-orange-200 object-cover sm:h-12 sm:w-12"
                                                                    />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="line-clamp-1 text-sm font-medium text-orange-800 sm:text-base">
                                                                            {item.produto.nome}
                                                                        </p>
                                                                        <p className="text-xs text-orange-600 sm:text-sm">
                                                                            {item.quantidade}x R${' '}
                                                                            {Number(item.preco_unitario).toFixed(2).replace('.', ',')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-right text-sm font-semibold text-orange-600 sm:text-left sm:text-base">
                                                                    R$ {(item.quantidade * item.preco_unitario).toFixed(2).replace('.', ',')}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Observações */}
                                                {pedido.observacoes && (
                                                    <div className="mb-4 sm:mb-6">
                                                        <h4 className="mb-2 text-sm font-semibold text-orange-800 sm:text-base">Observações</h4>
                                                        <p className="rounded-lg border-2 border-orange-200 bg-white p-3 text-sm text-orange-600 sm:text-base">
                                                            {pedido.observacoes}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex flex-col gap-3 border-t border-orange-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="text-xs text-orange-600 sm:text-sm">
                                                        <p>Última atualização: {formatDate(pedido.updated_at)}</p>
                                                    </div>
                                                    {/* <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 sm:w-auto"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver Detalhes
                                                    </Button> */}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="py-8 text-center sm:py-12"
                                >
                                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white py-8 text-center shadow-xl sm:py-12">
                                        <CardContent>
                                            <Package className="mx-auto mb-4 h-12 w-12 text-orange-400 sm:h-16 sm:w-16" />
                                            <h3 className="mb-2 text-lg font-semibold text-orange-800 sm:text-xl">Nenhum pedido encontrado</h3>
                                            <p className="mb-6 text-sm text-orange-600 sm:text-base">
                                                Você ainda não fez nenhum pedido. Que tal começar agora?
                                            </p>
                                            <Button
                                                onClick={() => (window.location.href = '/')}
                                                className="bg-gradient-to-r from-orange-600 to-red-600 font-semibold text-white transition-all duration-300 hover:from-orange-700 hover:to-red-700"
                                            >
                                                Ver Cardápio
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
