<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProdutoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $produtos = Produto::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Produtos/Index', [
            'produtos' => $produtos,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Produtos', 'href' => '/admin/produtos'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Produtos/Create', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Produtos', 'href' => '/admin/produtos'],
                ['title' => 'Novo Produto', 'href' => '/admin/produtos/create'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Dados recebidos:', $request->all());

        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string',
            'preco' => 'required|numeric|min:0',
            'imagem' => 'nullable|string',
            'destaque_dia' => 'boolean',
            'ativo' => 'boolean',
        ]);

        $data = $request->all();
        Log::info('Dados após validação:', $data);

        // Se a imagem for um arquivo, salva no storage
        if ($request->hasFile('imagem')) {
            $imagemPath = $request->file('imagem')->store('produtos', 'public');
            $data['imagem'] = $imagemPath;
        }
        // Se for uma URL, mantém como está
        elseif ($request->filled('imagem')) {
            $data['imagem'] = $request->imagem;
        }

        Log::info('Dados finais para criação:', $data);

        $produto = Produto::create($data);
        Log::info('Produto criado com ID:', ['id' => $produto->id]);

        return redirect()->route('admin.produtos.index')
            ->with('success', 'Produto criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Produto $produto)
    {
        return Inertia::render('Admin/Produtos/Show', [
            'produto' => $produto,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Produtos', 'href' => '/admin/produtos'],
                ['title' => $produto->nome, 'href' => "/admin/produtos/{$produto->id}"],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produto $produto)
    {
        return Inertia::render('Admin/Produtos/Edit', [
            'produto' => $produto,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Produtos', 'href' => '/admin/produtos'],
                ['title' => 'Editar '.$produto->nome, 'href' => "/admin/produtos/{$produto->id}/edit"],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Produto $produto)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string',
            'preco' => 'required|numeric|min:0',
            'imagem' => 'nullable|string',
            'destaque_dia' => 'boolean',
            'ativo' => 'boolean',
        ]);

        $data = $request->all();

        // Debug: Log dos valores recebidos
        Log::info('Dados recebidos na edição:', [
            'all_data' => $request->all(),
            'destaque_dia_raw' => $request->input('destaque_dia'),
            'ativo_raw' => $request->input('ativo'),
        ]);

        // Converte valores booleanos
        $data['destaque_dia'] = $request->boolean('destaque_dia');
        $data['ativo'] = $request->boolean('ativo');

        // Debug: Log dos valores convertidos
        Log::info('Valores booleanos convertidos:', [
            'destaque_dia' => $data['destaque_dia'],
            'ativo' => $data['ativo'],
        ]);

        // Atualiza a imagem (URL)
        if ($request->has('imagem')) {
            $data['imagem'] = $request->imagem;
        }

        $produto->update($data);

        // Retorna JSON para requisições AJAX
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Produto atualizado com sucesso!',
                'produto' => $produto->fresh(),
            ]);
        }

        return redirect()->route('admin.produtos.index')
            ->with('success', 'Produto atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produto $produto)
    {
        if ($produto->imagem && ! filter_var($produto->imagem, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($produto->imagem);
        }

        $produto->delete();

        // Retorna JSON para requisições AJAX
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Produto excluído com sucesso!',
            ]);
        }

        return redirect()->route('admin.produtos.index')
            ->with('success', 'Produto excluído com sucesso!');
    }

    /**
     * Toggle destaque do dia
     */
    public function toggleDestaque(Produto $produto)
    {
        $produto->update([
            'destaque_dia' => ! $produto->destaque_dia,
        ]);

        return response()->json([
            'success' => true,
            'destaque_dia' => $produto->destaque_dia,
        ]);
    }
}
