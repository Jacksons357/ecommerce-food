<?php

namespace App\Http\Controllers;

use App\Models\Carrinho;
use App\Models\Pedido;
use App\Models\PedidoItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PedidoController extends Controller
{
    /**
     * Exibe pedidos do usuário
     */
    public function index()
    {
        $usuario = auth()->user();
        $pedidos = $usuario->pedidos()
            ->with(['items.produto'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pedido) {
                $pedido->items_count = $pedido->items->sum('quantidade');

                return $pedido;
            });

        return Inertia::render('Pedidos/Index', [
            'pedidos' => $pedidos,
        ]);
    }

    /**
     * Exibe pedidos para admin
     */
    public function adminIndex()
    {
        $pedidos = Pedido::with(['usuario', 'items.produto'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Pedidos/Index', [
            'pedidos' => $pedidos,
        ]);
    }

    /**
     * Finaliza pedido
     */
    public function finalizar(Request $request)
    {
        $request->validate([
            'observacoes' => 'nullable|string',
        ]);

        $usuario = auth()->user();
        $carrinho = $usuario->carrinho;

        if (! $carrinho || $carrinho->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Carrinho vazio!',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Cria o pedido
            $pedido = Pedido::create([
                'usuario_id' => $usuario->id,
                'total' => $carrinho->total,
                'observacoes' => $request->observacoes,
                'status' => 'pendente',
            ]);

            // Cria os itens do pedido
            foreach ($carrinho->items as $item) {
                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'produto_id' => $item->produto_id,
                    'quantidade' => $item->quantidade,
                    'preco_unitario' => $item->preco_unitario,
                ]);
            }

            // Limpa o carrinho
            $carrinho->items()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido finalizado com sucesso!',
                'pedido_id' => $pedido->id,
            ]);
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Erro ao finalizar pedido!',
            ], 500);
        }
    }

    /**
     * Atualiza status do pedido (admin)
     */
    public function atualizarStatus(Request $request, Pedido $pedido)
    {
        $request->validate([
            'status' => 'required|in:pendente,preparando,pronto,entregue,cancelado',
        ]);

        $pedido->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status atualizado com sucesso!',
        ]);
    }

    /**
     * Exibe detalhes do pedido
     */
    public function show(Pedido $pedido)
    {
        $usuario = auth()->user();

        // Verifica se o usuário pode ver este pedido
        if (! $usuario->isAdmin() && $pedido->usuario_id !== $usuario->id) {
            abort(403);
        }

        $pedido->load(['usuario', 'items.produto']);

        return Inertia::render('Pedidos/Show', [
            'pedido' => $pedido,
        ]);
    }
}
