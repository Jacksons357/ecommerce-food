<?php

namespace App\Http\Controllers;

use App\Models\Carrinho;
use App\Models\Pedido;
use App\Models\PedidoItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
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
            ->get()
            ->map(function ($pedido) {
                $pedido->items_count = $pedido->items->sum('quantidade');
                return $pedido;
            });

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

            // Carrega os itens do carrinho com eager loading
            $carrinho->load('items.produto');

            // Calcula o total real
            $total = $carrinho->items->sum(function ($item) {
                return $item->preco_unitario * $item->quantidade;
            });

            // Cria o pedido
            $pedido = Pedido::create([
                'usuario_id' => $usuario->id,
                'total' => $total,
                'observacoes' => $request->observacoes,
                'status' => 'pendente',
            ]);

            // Cria os itens do pedido em lote
            $pedidoItems = $carrinho->items->map(function ($item) use ($pedido) {
                return [
                    'pedido_id' => $pedido->id,
                    'produto_id' => $item->produto_id,
                    'quantidade' => $item->quantidade,
                    'preco_unitario' => $item->preco_unitario,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            PedidoItem::insert($pedidoItems);

            // Limpa o carrinho
            $carrinho->items()->delete();

            // Limpa o cache do carrinho
            $cacheKey = "cart_data_{$usuario->id}";
            Cache::forget($cacheKey);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido finalizado com sucesso!',
                'pedido_id' => $pedido->id,
            ]);
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao finalizar pedido: ' . $e->getMessage(), [
                'user_id' => $usuario->id,
                'carrinho_id' => $carrinho->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

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

        // Retorna para a página de pedidos com mensagem de sucesso
        return redirect()->back()->with('success', 'Status atualizado com sucesso!');
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
