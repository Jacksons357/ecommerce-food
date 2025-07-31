import { Head, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

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
        <h1 className="text-2xl font-bold text-green-600 mb-4">Teste de Acesso Admin</h1>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">{message}</p>
            <p className="text-green-700 mt-2">
              Se você está vendo esta mensagem, o middleware admin está funcionando corretamente.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-blue-800 font-semibold mb-2">Informações do Usuário:</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {auth?.user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {auth?.user?.email || 'N/A'}</p>
              <p><strong>Tipo:</strong> {auth?.user?.tipo_usuario || 'N/A'}</p>
              <p><strong>É Admin:</strong> {auth?.isAdmin ? 'Sim' : 'Não'}</p>
              <p><strong>URL Atual:</strong> {page.url}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-yellow-800 font-semibold mb-2">Layout Atual:</h2>
            <p className="text-yellow-700">
              {auth?.isAdmin 
                ? '✅ Usando layout com sidebar (AppSidebarLayout)' 
                : '❌ Usando layout sem sidebar (ClientLayout)'
              }
            </p>
            <p className="text-yellow-700 mt-2">
              <strong>Debug:</strong> auth?.isAdmin = {String(auth?.isAdmin)}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h2 className="text-purple-800 font-semibold mb-2">Links de Teste:</h2>
            <div className="space-y-2">
              <a href="/admin/produtos" className="block text-purple-600 hover:text-purple-800 underline">
                → Ir para Gerenciar Produtos
              </a>
              <a href="/dashboard" className="block text-purple-600 hover:text-purple-800 underline">
                → Ir para Dashboard
              </a>
              <a href="/admin/test" className="block text-purple-600 hover:text-purple-800 underline">
                → Recarregar esta página
              </a>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Verificação de Layout:</h2>
            <p className="text-red-700 text-sm">
              Se você está vendo uma sidebar à esquerda com navegação, o layout está funcionando corretamente.
              Se não estiver vendo a sidebar, há um problema com a detecção do tipo de usuário ou com o layout.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 