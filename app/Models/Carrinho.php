<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrinho extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
    ];

    /**
     * Relacionamento com usuário
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relacionamento com itens do carrinho
     */
    public function items()
    {
        return $this->hasMany(CarrinhoItem::class);
    }

    /**
     * Calcula o total do carrinho
     */
    public function getTotalAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->quantidade * $item->preco_unitario;
        });
    }

    /**
     * Calcula a quantidade total de itens
     */
    public function getQuantidadeTotalAttribute()
    {
        return $this->items->sum('quantidade');
    }
}
