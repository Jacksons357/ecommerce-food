import { Link } from '@inertiajs/react';
import { ShoppingCart, Home, Package, LogIn, UserPlus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useCartCount } from '@/components/cart-counter';
import { NavUser } from './nav-user';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const cartCount = useCartCount();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <span className="text-lg sm:text-xl font-bold text-neutral-100">
                                Global Food
                            </span>
                        </Link>
                    </div>

                    {/* Links de navegação - Desktop */}
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
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Carrinho - para todos os usuários */}
                        <Link href={auth?.user ? "/carrinho" : "/carrinho-publico"} className="relative">
                            <Button variant="ghost" size="sm" className="relative cursor-pointer text-neutral-300 hover:text-neutral-100 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 sm:gap-2">
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Carrinho</span>
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

                        {/* Botões de autenticação - Desktop */}
                        {!auth?.user ? (
                            <div className="hidden sm:flex items-center space-x-2">
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
                            <div className="hidden sm:flex items-center space-x-2">
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

                        {/* Menu Mobile */}
                        <div className="md:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-80 bg-slate-800 border-slate-700">
                                    <SheetHeader className="text-left">
                                        <SheetTitle className="text-neutral-100">Menu</SheetTitle>
                                    </SheetHeader>
                                    
                                    <div className="mt-6 space-y-4">
                                        {/* Links de navegação */}
                                        <div className="space-y-2">
                                            <Link
                                                href="/"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                            >
                                                <Home className="h-4 w-4" />
                                                Home
                                            </Link>
                                            <Link
                                                href="/produtos"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                            >
                                                <Package className="h-4 w-4" />
                                                Produtos
                                            </Link>
                                        </div>

                                        <hr className="border-slate-700" />

                                        {/* Autenticação */}
                                        {!auth?.user ? (
                                            <div className="space-y-2">
                                                <Link
                                                    href="/login"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    <LogIn className="h-4 w-4" />
                                                    Login
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                    Registrar
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {auth.user.tipo_usuario === 'admin' && (
                                                    <Link
                                                        href="/dashboard"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/pedidos"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 text-neutral-300 hover:text-neutral-100 px-3 py-2 rounded-md text-sm font-medium"
                                                >
                                                    <Package className="h-4 w-4" />
                                                    Meus Pedidos
                                                </Link>
                                                <div className="pt-2">
                                                    <NavUser />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
} 