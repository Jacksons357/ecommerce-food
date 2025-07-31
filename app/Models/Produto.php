<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'imagem',
        'destaque_dia',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'destaque_dia' => 'boolean',
        'ativo' => 'boolean',
    ];

    /**
     * Relacionamento com itens do carrinho
     */
    public function carrinhoItems()
    {
        return $this->hasMany(CarrinhoItem::class);
    }

    /**
     * Relacionamento com itens de pedidos
     */
    public function pedidoItems()
    {
        return $this->hasMany(PedidoItem::class);
    }

    /**
     * Scope para produtos ativos
     */
    public function scopeAtivos($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope para produtos em destaque
     */
    public function scopeDestaque($query)
    {
        return $query->where('destaque_dia', true);
    }
}
