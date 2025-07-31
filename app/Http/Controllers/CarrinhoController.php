<?php

namespace App\Http\Controllers;

use App\Models\Carrinho;
use App\Models\CarrinhoItem;
use App\Models\Produto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarrinhoController extends Controller
{

    /**
     * Exibe o carrinho do usuário
     */
    public function index()
    {
        $usuario = auth()->user();
        $carrinho = $usuario->carrinho;

        if (!$carrinho) {
            $carrinho = Carrinho::create(['usuario_id' => $usuario->id]);
        }

        $carrinho->load('items.produto');

        return Inertia::render('Carrinho/Index', [
            'carrinho' => $carrinho,
        ]);
    }

    /**
     * Adiciona produto ao carrinho
     */
    public function adicionar(Request $request)
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|integer|min:1',
        ]);

        $usuario = auth()->user();
        $produto = Produto::findOrFail($request->produto_id);

        // Verifica se o produto está ativo
        if (!$produto->ativo) {
            return response()->json([
                'success' => false,
                'message' => 'Produto não está disponível'
            ], 400);
        }

        // Busca ou cria carrinho
        $carrinho = $usuario->carrinho;
        if (!$carrinho) {
            $carrinho = Carrinho::create(['usuario_id' => $usuario->id]);
        }

        // Verifica se o produto já está no carrinho
        $itemExistente = $carrinho->items()->where('produto_id', $produto->id)->first();

        if ($itemExistente) {
            // Atualiza quantidade
            $itemExistente->update([
                'quantidade' => $itemExistente->quantidade + $request->quantidade
            ]);
        } else {
            // Cria novo item
            CarrinhoItem::create([
                'carrinho_id' => $carrinho->id,
                'produto_id' => $produto->id,
                'quantidade' => $request->quantidade,
                'preco_unitario' => $produto->preco,
            ]);
        }

        $carrinho->load('items.produto');

        return response()->json([
            'success' => true,
            'message' => 'Produto adicionado ao carrinho!',
            'carrinho' => $carrinho,
        ]);
    }

    /**
     * Atualiza quantidade de um item
     */
    public function atualizarQuantidade(Request $request, CarrinhoItem $item)
    {
        $request->validate([
            'quantidade' => 'required|integer|min:1',
        ]);

        $usuario = auth()->user();

        // Verifica se o item pertence ao usuário
        if ($item->carrinho->usuario_id !== $usuario->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item não pertence ao seu carrinho'
            ], 403);
        }

        $item->update(['quantidade' => $request->quantidade]);

        $carrinho = $usuario->carrinho->load('items.produto');

        return response()->json([
            'success' => true,
            'carrinho' => $carrinho,
        ]);
    }

    /**
     * Remove item do carrinho
     */
    public function removerItem(CarrinhoItem $item)
    {
        $usuario = auth()->user();

        // Verifica se o item pertence ao usuário
        if ($item->carrinho->usuario_id !== $usuario->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item não pertence ao seu carrinho'
            ], 403);
        }

        $item->delete();

        $carrinho = $usuario->carrinho->load('items.produto');

        return response()->json([
            'success' => true,
            'message' => 'Item removido do carrinho!',
            'carrinho' => $carrinho,
        ]);
    }

    /**
     * Limpa o carrinho
     */
    public function limpar()
    {
        $usuario = auth()->user();
        $carrinho = $usuario->carrinho;

        if ($carrinho) {
            $carrinho->items()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Carrinho limpo com sucesso!',
        ]);
    }

    /**
     * Sincroniza carrinho do localStorage com o banco
     */
    public function sincronizar(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.produto_id' => 'required|exists:produtos,id',
            'items.*.quantidade' => 'required|integer|min:1',
        ]);

        $usuario = auth()->user();

        // Busca ou cria carrinho
        $carrinho = $usuario->carrinho;
        if (!$carrinho) {
            $carrinho = Carrinho::create(['usuario_id' => $usuario->id]);
        }

        // Limpa carrinho atual
        $carrinho->items()->delete();

        // Adiciona itens do localStorage
        foreach ($request->items as $item) {
            $produto = Produto::findOrFail($item['produto_id']);

            if ($produto->ativo) {
                CarrinhoItem::create([
                    'carrinho_id' => $carrinho->id,
                    'produto_id' => $produto->id,
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                ]);
            }
        }

        $carrinho->load('items.produto');

        return response()->json([
            'success' => true,
            'message' => 'Carrinho sincronizado com sucesso!',
            'carrinho' => $carrinho,
        ]);
    }
}
