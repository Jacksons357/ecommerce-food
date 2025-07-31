import { Link } from '@inertiajs/react';
import { ShoppingCart, Home, Package, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useCart } from '@/hooks/use-cart-store';
import { NavUser } from './nav-user';

export function Navbar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { cartCount } = useCart();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                        
                            <span className="text-xl font-bold text-neutral-100">
                                Global Food
                            </span>
                        </Link>
                    </div>

                    {/* Links de navegação */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                href="/"
                                className="text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                            <Link
                                href="/produtos"
                                className="text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                            >
                                <Package className="h-4 w-4" />
                                Produtos
                            </Link>
                        </div>
                    </div>

                    {/* Ações do lado direito */}
                    <div className="flex items-center space-x-4">
                        {/* Carrinho - para todos os usuários */}
                        <Link href={auth?.user ? "/carrinho" : "/carrinho-publico"} className="relative">
                            <Button variant="ghost" size="sm" className="relative cursor-pointer text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                    >
                                        {cartCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

                        {/* Botões de autenticação */}
                        {!auth?.user ? (
                            <div className="flex items-center space-x-2">
                                <Link href="/login" >
                                    <Button variant="ghost" size="sm" className="relative cursor-pointer text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="relative cursor-pointer text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Registrar
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                {auth.user.tipo_usuario === 'admin' && (
                                    <Link href="/dashboard">
                                        <Button variant="ghost" size="sm">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/pedidos" className='text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2'>
                                    <Package className="h-4 w-4" />
                                        <span>Meus Pedidos</span>
                                </Link>

                                    
                                <NavUser />

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 