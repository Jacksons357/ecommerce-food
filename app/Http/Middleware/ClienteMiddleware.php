<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClienteMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            abort(403, 'Acesso negado. Você precisa estar logado para acessar esta área.');
        }

        if (! auth()->user()->isCliente()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Administradores não podem acessar o carrinho',
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', 'Administradores não podem acessar o carrinho');
        }

        return $next($request);
    }
}
