import { motion } from 'framer-motion';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X } from 'lucide-react';
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
  produto: Produto;
}

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

export default function AdminProdutosEdit({ produto }: Props) {
  const [formData, setFormData] = useState({
    nome: produto.nome,
    descricao: produto.descricao,
    preco: produto.preco.toString(),
    imagem: produto.imagem,
    destaque_dia: Boolean(produto.destaque_dia),
    ativo: Boolean(produto.ativo),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [precoFormatado, setPrecoFormatado] = useState(formatPrice(produto.preco.toString()));
  const [imagePreview, setImagePreview] = useState<string>(produto.imagem);
  const { toast } = useToast();

  // Debug: Log dos valores iniciais
  console.log('Valores iniciais do produto:', {
    produto_destaque_dia: produto.destaque_dia,
    produto_ativo: produto.ativo,
    formData_destaque_dia: formData.destaque_dia,
    formData_ativo: formData.ativo,
  });

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPrice(value);
    setPrecoFormatado(formatted);
    setFormData(prev => ({ ...prev, preco: parsePrice(formatted) }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imagem: url }));
    setImagePreview(url);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imagem: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT');
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('preco', formData.preco);
      formDataToSend.append('destaque_dia', formData.destaque_dia ? '1' : '0');
      formDataToSend.append('ativo', formData.ativo ? '1' : '0');

      // Debug: Log dos valores
      console.log('Valores dos checkboxes:', {
        destaque_dia: formData.destaque_dia,
        ativo: formData.ativo,
        destaque_dia_sent: formData.destaque_dia ? '1' : '0',
        ativo_sent: formData.ativo ? '1' : '0'
      });

      // Adiciona a URL da imagem
      if (formData.imagem) {
        formDataToSend.append('imagem', formData.imagem);
      }

      const response = await fetch(`/admin/produtos/${produto.id}`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso!",
          variant: "success",
        });
        router.visit('/admin/produtos');
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao atualizar produto",
          description: errorData.message || 'Erro ao atualizar produto',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Head title={`Administração - Editar ${produto.nome}`} />
      
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
            <h1 className="text-3xl font-bold text-zinc-100">Editar Produto</h1>
            <p className="text-gray-100">Atualize as informações do produto</p>
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
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: X-Burger Clássico"
                    required
                    className="text-neutral-100"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
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
                    className="text-neutral-100"
                  />
                </div>

                {/* Imagem */}
                <div className="space-y-4">
                  <Label htmlFor="imagem">URL da Imagem</Label>
                  
                  <div className="space-y-2">
                    <Input
                      id="imagem"
                      type="text"
                      value={formData.imagem}
                      onChange={handleImageUrlChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="text-neutral-100"
                    />
                    <p className="text-sm text-gray-500">
                      Cole aqui a URL da imagem do produto
                    </p>
                  </div>
                  
                  {/* Preview da imagem */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
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
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Opções */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="destaque_dia"
                      checked={formData.destaque_dia}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, destaque_dia: checked as boolean }))
                      }
                    />
                    <Label htmlFor="destaque_dia">Destaque do Dia</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, ativo: checked as boolean }))
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
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Atualizar Produto
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