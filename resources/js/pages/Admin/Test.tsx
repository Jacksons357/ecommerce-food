import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface Props {
    message: string;
}

export default function AdminTest({ message }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <>
            <Head title="Teste Admin" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold text-green-600">Teste de Acesso Admin</h1>

                <div className="space-y-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="font-semibold text-green-800">{message}</p>
                        <p className="mt-2 text-green-700">Se você está vendo esta mensagem, o middleware admin está funcionando corretamente.</p>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h2 className="mb-2 font-semibold text-blue-800">Informações do Usuário:</h2>
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>Nome:</strong> {auth?.user?.name || 'N/A'}
                            </p>
                            <p>
                                <strong>Email:</strong> {auth?.user?.email || 'N/A'}
                            </p>
                            <p>
                                <strong>Tipo:</strong> {auth?.user?.tipo_usuario || 'N/A'}
                            </p>
                            <p>
                                <strong>É Admin:</strong> {auth?.isAdmin ? 'Sim' : 'Não'}
                            </p>
                            <p>
                                <strong>URL Atual:</strong> {page.url}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <h2 className="mb-2 font-semibold text-yellow-800">Layout Atual:</h2>
                        <p className="text-yellow-700">
                            {auth?.isAdmin ? '✅ Usando layout com sidebar (AppSidebarLayout)' : '❌ Usando layout sem sidebar (ClientLayout)'}
                        </p>
                        <p className="mt-2 text-yellow-700">
                            <strong>Debug:</strong> auth?.isAdmin = {String(auth?.isAdmin)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <h2 className="mb-2 font-semibold text-purple-800">Links de Teste:</h2>
                        <div className="space-y-2">
                            <a href="/admin/produtos" className="block text-purple-600 underline hover:text-purple-800">
                                → Ir para Gerenciar Produtos
                            </a>
                            <a href="/dashboard" className="block text-purple-600 underline hover:text-purple-800">
                                → Ir para Dashboard
                            </a>
                            <a href="/admin/test" className="block text-purple-600 underline hover:text-purple-800">
                                → Recarregar esta página
                            </a>
                        </div>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h2 className="mb-2 font-semibold text-red-800">Verificação de Layout:</h2>
                        <p className="text-sm text-red-700">
                            Se você está vendo uma sidebar à esquerda com navegação, o layout está funcionando corretamente. Se não estiver vendo a
                            sidebar, há um problema com a detecção do tipo de usuário ou com o layout.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
