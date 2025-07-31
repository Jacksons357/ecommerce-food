<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProdutoController;
use App\Http\Controllers\CarrinhoController;
use App\Http\Controllers\CarrinhoPublicoController;
use App\Http\Controllers\PedidoController;

// Rota principal
Route::get('/', [HomeController::class, 'index'])->name('home');

// Rotas públicas de produtos
Route::get('/produtos', function () {
    return Inertia::render('Produtos/Index', [
        'produtos' => \App\Models\Produto::ativos()->get(),
    ]);
})->name('produtos.index');

// Rota de contato
Route::get('/contato', function () {
    return Inertia::render('Contato');
})->name('contato');

// API para verificar tipo de usuário
Route::get('/api/user-type', function () {
    if (!auth()->check()) {
        return response()->json(['tipo_usuario' => null]);
    }
    return response()->json(['tipo_usuario' => auth()->user()->tipo_usuario]);
})->name('api.user-type');

// API para contador do carrinho
Route::get('/api/cart-count', function () {
    if (!auth()->check()) {
        return response()->json(['count' => 0]);
    }

    $carrinho = auth()->user()->carrinho;
    $count = $carrinho ? $carrinho->items()->sum('quantidade') : 0;

    return response()->json(['count' => $count]);
})->name('api.cart-count');

// API para dados completos do carrinho
Route::get('/api/cart-data', function () {
    if (!auth()->check()) {
        return response()->json(['items' => [], 'count' => 0, 'total' => 0]);
    }

    $carrinho = auth()->user()->carrinho;
    if (!$carrinho) {
        return response()->json(['items' => [], 'count' => 0, 'total' => 0]);
    }

    $carrinho->load('items.produto');
    $items = $carrinho->items->map(function ($item) {
        return [
            'id' => $item->id,
            'produto_id' => $item->produto_id,
            'nome' => $item->produto->nome,
            'preco' => $item->preco_unitario,
            'quantidade' => $item->quantidade,
            'imagem' => $item->produto->imagem,
        ];
    });

    $count = $items->sum('quantidade');
    $total = $items->sum(function ($item) {
        return $item['preco'] * $item['quantidade'];
    });

    return response()->json([
        'items' => $items,
        'count' => $count,
        'total' => $total,
    ]);
})->name('api.cart-data');

// Rotas públicas do carrinho (localStorage)
Route::prefix('carrinho-publico')->name('carrinho-publico.')->group(function () {
    Route::get('/', [CarrinhoPublicoController::class, 'index'])->name('index');
    Route::post('/adicionar', [CarrinhoPublicoController::class, 'adicionar'])->name('adicionar');
    Route::get('/produto/{id}', [CarrinhoPublicoController::class, 'produto'])->name('produto');
});

// Rotas autenticadas
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard dinâmico baseado no tipo de usuário
    Route::get('dashboard', function () {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        if ($isAdmin) {
            // Dados para admin
            $stats = [
                'total_produtos' => \App\Models\Produto::count(),
                'total_pedidos' => \App\Models\Pedido::count(),
                'pedidos_pendentes' => \App\Models\Pedido::where('status', 'pendente')->count(),
                'faturamento_total' => \App\Models\Pedido::where('status', 'entregue')->sum('total'),
            ];

            $produtos = \App\Models\Produto::latest()->take(5)->get();
            $pedidos = \App\Models\Pedido::with('items')->latest()->take(5)->get();

            return Inertia::render('dashboard', [
                'isAdmin' => true,
                'stats' => $stats,
                'produtos' => $produtos,
                'pedidos' => $pedidos,
            ]);
        } else {
            // Dados para cliente
            $pedidos = $user->pedidos()->with('items.produto')->latest()->take(5)->get();

            return Inertia::render('dashboard', [
                'isAdmin' => false,
                'pedidos' => $pedidos,
            ]);
        }
    })->name('dashboard');

    // Carrinho
    Route::prefix('carrinho')->name('carrinho.')->group(function () {
        Route::get('/', [CarrinhoController::class, 'index'])->name('index');
        Route::post('/adicionar', [CarrinhoController::class, 'adicionar'])->name('adicionar');
        Route::put('/quantidade/{item}', [CarrinhoController::class, 'atualizarQuantidade'])->name('quantidade');
        Route::delete('/item/{item}', [CarrinhoController::class, 'removerItem'])->name('remover-item');
        Route::delete('/limpar', [CarrinhoController::class, 'limpar'])->name('limpar');
        Route::post('/sincronizar', [CarrinhoController::class, 'sincronizar'])->name('sincronizar');
    });

    // Pedidos
    Route::prefix('pedidos')->name('pedidos.')->group(function () {
        Route::get('/', [PedidoController::class, 'index'])->name('index');
        Route::post('/finalizar', [PedidoController::class, 'finalizar'])->name('finalizar');
        Route::get('/{pedido}', [PedidoController::class, 'show'])->name('show');
    });

    // Rotas de administrador
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        // Rota de teste
        Route::get('test', function () {
            return Inertia::render('Admin/Test', [
                'message' => 'Middleware admin funcionando!'
            ]);
        })->name('test');

        // Produtos
        Route::resource('produtos', ProdutoController::class);
        Route::put('produtos/{produto}/destaque', [ProdutoController::class, 'toggleDestaque'])->name('produtos.destaque');

        // Pedidos
        Route::get('pedidos', [PedidoController::class, 'adminIndex'])->name('pedidos.index');
        Route::put('pedidos/{pedido}/status', [PedidoController::class, 'atualizarStatus'])->name('pedidos.status');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
