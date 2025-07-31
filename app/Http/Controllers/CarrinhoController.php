<?php

namespace App\Http\Controllers;

use App\Models\Carrinho;
use App\Models\CarrinhoItem;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CarrinhoController extends Controller
{
    /**
     * Exibe o carrinho do usuário
     */
    public function index()
    {
        $usuario = Auth::user();
        $carrinho = $usuario->carrinho;

        if (! $carrinho) {
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
        Log::info('CarrinhoController@adicionar - Iniciando requisição');
        Log::info('Request data:', $request->all());

        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|integer|min:1',
        ]);

        $usuario = Auth::user();
        Log::info('Usuário: ' . ($usuario ? $usuario->name : 'Não autenticado'));

        // Verifica se o usuário é admin
        if ($usuario && $usuario->isAdmin()) {
            Log::info('Admin tentou adicionar produto ao carrinho');
            return response()->json([
                'success' => false,
                'message' => 'Administradores não podem adicionar produtos ao carrinho',
            ], 403);
        }

        $produto = Produto::findOrFail($request->produto_id);

        // Verifica se o produto está ativo
        if (! $produto->ativo) {
            return response()->json([
                'success' => false,
                'message' => 'Produto não está disponível',
            ], 400);
        }

        // Busca ou cria carrinho
        $carrinho = $usuario->carrinho;
        if (! $carrinho) {
            $carrinho = Carrinho::create(['usuario_id' => $usuario->id]);
        }

        // Verifica se o produto já está no carrinho
        $itemExistente = $carrinho->items()->where('produto_id', $produto->id)->first();

        if ($itemExistente) {
            // Atualiza quantidade
            $itemExistente->update([
                'quantidade' => $itemExistente->quantidade + $request->quantidade,
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

        // Invalidar cache do carrinho
        $cacheKey = "cart_data_{$usuario->id}";
        Cache::forget($cacheKey);

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

        $usuario = Auth::user();

        // Verifica se o item pertence ao usuário
        if ($item->carrinho->usuario_id !== $usuario->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item não pertence ao seu carrinho',
            ], 403);
        }

        $item->update(['quantidade' => $request->quantidade]);

        // Invalidar cache do carrinho
        $cacheKey = "cart_data_{$usuario->id}";
        Cache::forget($cacheKey);

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
        $usuario = Auth::user();

        // Verifica se o item pertence ao usuário
        if ($item->carrinho->usuario_id !== $usuario->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item não pertence ao seu carrinho',
            ], 403);
        }

        $item->delete();

        // Invalidar cache do carrinho
        $cacheKey = "cart_data_{$usuario->id}";
        Cache::forget($cacheKey);

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
        $usuario = Auth::user();
        $carrinho = $usuario->carrinho;

        if ($carrinho) {
            $carrinho->items()->delete();
        }

        // Invalidar cache do carrinho
        $cacheKey = "cart_data_{$usuario->id}";
        Cache::forget($cacheKey);

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
        Log::info('CarrinhoController@sincronizar - Iniciando requisição');
        Log::info('Request data:', $request->all());

        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.produto_id' => 'required|exists:produtos,id',
                'items.*.quantidade' => 'required|integer|min:1',
            ]);

            $usuario = Auth::user();
            Log::info('Usuário autenticado:', ['id' => $usuario->id, 'name' => $usuario->name]);

            // Busca ou cria carrinho
            $carrinho = $usuario->carrinho;
            if (! $carrinho) {
                Log::info('Criando novo carrinho para usuário');
                $carrinho = Carrinho::create(['usuario_id' => $usuario->id]);
            } else {
                Log::info('Carrinho existente encontrado:', ['id' => $carrinho->id]);
            }

            // Limpa carrinho atual
            Log::info('Limpando carrinho atual');
            $carrinho->items()->delete();

            // Adiciona itens do localStorage
            Log::info('Adicionando itens do localStorage:', $request->items);
            foreach ($request->items as $item) {
                $produto = Produto::findOrFail($item['produto_id']);

                if ($produto->ativo) {
                    CarrinhoItem::create([
                        'carrinho_id' => $carrinho->id,
                        'produto_id' => $produto->id,
                        'quantidade' => $item['quantidade'],
                        'preco_unitario' => $produto->preco,
                    ]);
                    Log::info('Item adicionado:', ['produto_id' => $produto->id, 'quantidade' => $item['quantidade']]);
                } else {
                    Log::warning('Produto inativo ignorado:', ['produto_id' => $produto->id]);
                }
            }

            // Invalidar cache do carrinho
            $cacheKey = "cart_data_{$usuario->id}";
            Cache::forget($cacheKey);
            Log::info('Cache invalidado');

            $carrinho->load('items.produto');
            Log::info('Carrinho sincronizado com sucesso');

            return response()->json([
                'success' => true,
                'message' => 'Carrinho sincronizado com sucesso!',
                'carrinho' => $carrinho,
            ]);
        } catch (\Exception $e) {
            Log::error('Erro na sincronização do carrinho:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao sincronizar carrinho: ' . $e->getMessage(),
            ], 500);
        }
    }
}
