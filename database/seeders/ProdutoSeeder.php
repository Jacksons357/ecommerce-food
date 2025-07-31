<?php

namespace Database\Seeders;

use App\Models\Produto;
use Illuminate\Database\Seeder;

class ProdutoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $produtos = [
            [
                'nome' => 'X-Burger Clássico',
                'descricao' => 'Hambúrguer artesanal com queijo, alface, tomate e molho especial',
                'preco' => 18.90,
                'imagem' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
                'destaque_dia' => true,
                'ativo' => true,
            ],
            [
                'nome' => 'X-Bacon Premium',
                'descricao' => 'Hambúrguer com bacon crocante, queijo cheddar e molho barbecue',
                'preco' => 24.90,
                'imagem' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop',
                'destaque_dia' => true,
                'ativo' => true,
            ],
            [
                'nome' => 'Batata Frita',
                'descricao' => 'Batatas fritas crocantes com sal e temperos especiais',
                'preco' => 12.90,
                'imagem' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
                'destaque_dia' => false,
                'ativo' => true,
            ],
            [
                'nome' => 'Refrigerante Cola',
                'descricao' => 'Refrigerante cola 350ml gelado',
                'preco' => 6.90,
                'imagem' => 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
                'destaque_dia' => false,
                'ativo' => true,
            ],
            [
                'nome' => 'Milk Shake Chocolate',
                'descricao' => 'Milk shake cremoso de chocolate com chantilly',
                'preco' => 15.90,
                'imagem' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
                'destaque_dia' => false,
                'ativo' => true,
            ],
            [
                'nome' => 'Combo X-Burger + Batata + Refri',
                'descricao' => 'X-Burger Clássico + Batata Frita + Refrigerante Cola',
                'preco' => 32.90,
                'imagem' => 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'destaque_dia' => true,
                'ativo' => true,
            ],
            [
                'nome' => 'Nuggets de Frango',
                'descricao' => '6 unidades de nuggets de frango crocantes',
                'preco' => 16.90,
                'imagem' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop',
                'destaque_dia' => false,
                'ativo' => true,
            ],
            [
                'nome' => 'Sorvete de Baunilha',
                'descricao' => 'Sorvete cremoso de baunilha com calda de chocolate',
                'preco' => 8.90,
                'imagem' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
                'destaque_dia' => false,
                'ativo' => true,
            ],
        ];

        foreach ($produtos as $produto) {
            Produto::create($produto);
        }

        $this->command->info('Produtos criados com sucesso!');
    }
}
