<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id',
        'produto_id',
        'quantidade',
        'preco_unitario',
    ];

    protected $casts = [
        'preco_unitario' => 'decimal:2',
    ];

    /**
     * Relacionamento com pedido
     */
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
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
