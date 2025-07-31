<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $produtosDestaque = Produto::ativos()->destaque()->get();
        $produtos = Produto::ativos()->get();

        return Inertia::render('Home', [
            'produtosDestaque' => $produtosDestaque,
            'produtos' => $produtos,
        ]);
    }
}
