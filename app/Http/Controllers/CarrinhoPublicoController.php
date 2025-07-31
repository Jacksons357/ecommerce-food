<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarrinhoPublicoController extends Controller
{
    /**
     * Exibe o carrinho público (localStorage)
     */
    public function index()
    {
        return Inertia::render('Carrinho/Publico');
    }

    /**
     * Adiciona produto ao carrinho público
     */
    public function adicionar(Request $request)
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|integer|min:1',
        ]);

        $produto = Produto::findOrFail($request->produto_id);

        // Verifica se o produto está ativo
        if (! $produto->ativo) {
            return response()->json([
                'success' => false,
                'message' => 'Produto não está disponível',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produto adicionado ao carrinho!',
            'produto' => [
                'id' => $produto->id,
                'nome' => $produto->nome,
                'preco' => $produto->preco,
                'imagem' => $produto->imagem,
            ],
        ]);
    }

    /**
     * Obtém informações do produto para o carrinho
     */
    public function produto($id)
    {
        $produto = Produto::findOrFail($id);

        return response()->json([
            'id' => $produto->id,
            'nome' => $produto->nome,
            'preco' => $produto->preco,
            'imagem' => $produto->imagem,
            'ativo' => $produto->ativo,
        ]);
    }
}
