import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface CartCounterProps {
    className?: string;
}

export function CartCounter({ className }: CartCounterProps) {
    const [itemCount, setItemCount] = useState(0);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const response = await fetch('/api/cart-count');
                if (response.ok) {
                    const data = await response.json();
                    setItemCount(data.count || 0);
                }
            } catch (error) {
                console.error('Erro ao buscar contador do carrinho:', error);
            }
        };

        fetchCartCount();
        
        // Atualizar a cada 5 segundos
        const interval = setInterval(fetchCartCount, 5000);
        
        return () => clearInterval(interval);
    }, []);

    if (itemCount === 0) return null;

    return (
        <Badge 
            className={`absolute -top-1 -right-1 bg-red-700 text-neutral-100 text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}
        >
            {itemCount > 99 ? '99+' : itemCount}
        </Badge>
    );
} 