import { motion } from 'framer-motion';
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';

// Função para formatar preço em reais
const formatPrice = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (numbers === '') return '';
  
  // Converte para centavos
  const cents = parseInt(numbers);
  
  // Formata para reais
  const reais = (cents / 100).toFixed(2);
  
  // Adiciona vírgula como separador de milhares
  return reais.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Função para converter preço formatado para número
const parsePrice = (value: string): string => {
  // Remove pontos e vírgulas, mantém apenas números
  const numbers = value.replace(/[.,]/g, '');
  
  if (numbers === '') return '';
  
  // Converte para centavos e depois para reais
  const cents = parseInt(numbers);
  return (cents / 100).toFixed(2);
};

export default function AdminProdutosCreate() {
  const { data, setData, post, processing } = useForm<{
    nome: string;
    descricao: string;
    preco: string;
    imagem: string;
    destaque_dia: boolean;
    ativo: boolean;
  }>({
    nome: '',
    descricao: '',
    preco: '',
    imagem: '',
    destaque_dia: false,
    ativo: true,
  });
  const [precoFormatado, setPrecoFormatado] = useState('');
  const { toast } = useToast();

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPrice(value);
    setPrecoFormatado(formatted);
    setData('preco', parsePrice(formatted));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Garantir que os tipos estejam corretos
    const dataToSend = {
      ...data,
      preco: parseFloat(data.preco),
      destaque_dia: Boolean(data.destaque_dia),
      ativo: Boolean(data.ativo),
    };

    console.log('Dados sendo enviados:', dataToSend);

    post('/admin/produtos', {
      onSuccess: () => {
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso!",
          variant: "success",
        });
        router.visit('/admin/produtos');
      },
      onError: (errors) => {
        console.error('Erro ao criar produto:', errors);
        toast({
          title: "Erro ao criar produto",
          description: Object.values(errors).join(', '),
          variant: "destructive",
        });
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setData('imagem', value);
  };

  return (
    <AppLayout>
      <Head title="Administração - Novo Produto" />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.visit('/admin/produtos')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Produtos
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Novo Produto</h1>
            <p className="text-gray-100">Crie um novo produto para o cardápio</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="">
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={data.nome}
                    onChange={(e) => setData('nome', e.target.value)}
                    placeholder="Ex: X-Burger Clássico"
                    required
                    className='text-neutral-100'
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={data.descricao}
                    onChange={(e) => setData('descricao', e.target.value)}
                    placeholder="Descreva o produto..."
                    rows={4}
                    required
                  />
                </div>

                {/* Preço */}
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="text"
                    value={precoFormatado}
                    onChange={handlePrecoChange}
                    placeholder="0,00"
                    required
                    className='text-neutral-100'    
                  />
                </div>

                {/* Imagem */}
                <div className="space-y-2">
                  <Label htmlFor="imagem">URL da Imagem</Label>
                  <div className="space-y-4">
                    <Input
                      id="imagem"
                      type="text"
                      value={data.imagem}
                      onChange={handleImageChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="text-neutral-100"
                    />
                    
                    {data.imagem && (
                      <div className="relative">
                        <img
                          src={data.imagem}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setData('imagem', '')}
                          className="absolute top-2 right-2 bg-white"
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opções */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="destaque_dia"
                      checked={data.destaque_dia}
                      onCheckedChange={(checked) => 
                        setData('destaque_dia', checked === true)
                      }
                    />
                    <Label htmlFor="destaque_dia">Destaque do Dia</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={data.ativo}
                      onCheckedChange={(checked) => 
                        setData('ativo', checked === true)
                      }
                    />
                    <Label htmlFor="ativo">Produto Ativo</Label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/admin/produtos')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Criar Produto
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
} 