<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'total',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    /**
     * Relacionamento com usuário
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Relacionamento com itens do pedido
     */
    public function items()
    {
        return $this->hasMany(PedidoItem::class);
    }
}
