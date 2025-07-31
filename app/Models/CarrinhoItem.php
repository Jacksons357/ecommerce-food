<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarrinhoItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'carrinho_id',
        'produto_id',
        'quantidade',
        'preco_unitario',
    ];

    protected $casts = [
        'preco_unitario' => 'decimal:2',
    ];

    /**
     * Relacionamento com carrinho
     */
    public function carrinho()
    {
        return $this->belongsTo(Carrinho::class);
    }

    /**
     * Relacionamento com produto
     */
    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    /**
     * Calcula o subtotal do item
     */
    public function getSubtotalAttribute()
    {
        return $this->quantidade * $this->preco_unitario;
    }
}
