import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Star } from 'lucide-react';

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
    produto: Produto;
}

export default function AdminProdutosShow({ produto }: Props) {
    return (
        <AppLayout>
            <Head title={`Administração - ${produto.nome}`} />

            <div className="p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
                    <Button variant="ghost" onClick={() => router.visit('/admin/produtos')} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar aos Produtos
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{produto.nome}</h1>
                            <p className="text-gray-600">Detalhes do produto</p>
                        </div>
                        <Button onClick={() => router.visit(`/admin/produtos/${produto.id}/edit`)} className="bg-orange-600 hover:bg-orange-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Produto
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Imagem */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Imagem do Produto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img src={produto.imagem} alt={produto.nome} className="h-64 w-full rounded-lg object-cover" />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Informações */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-6"
                    >
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <Badge variant={produto.ativo ? 'default' : 'secondary'}>{produto.ativo ? 'Ativo' : 'Inativo'}</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Destaque do Dia:</span>
                                    <Badge variant={produto.destaque_dia ? 'default' : 'secondary'}>
                                        {produto.destaque_dia ? (
                                            <>
                                                <Star className="mr-1 h-3 w-3" />
                                                Sim
                                            </>
                                        ) : (
                                            'Não'
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preço */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preço</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-orange-600">R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</div>
                            </CardContent>
                        </Card>

                        {/* Descrição */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Descrição</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-gray-700">{produto.descricao}</p>
                            </CardContent>
                        </Card>

                        {/* Datas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Criado em:</span>
                                    <span className="text-gray-100">{new Date(produto.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Última atualização:</span>
                                    <span className="text-gray-100">{new Date(produto.updated_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
