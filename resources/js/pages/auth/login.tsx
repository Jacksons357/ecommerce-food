import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
            <div className="hidden lg:flex flex-col items-center justify-center bg-neutral-900">
                <img src="/images/logo_burguer.png" alt="Logo" className="" />
            </div>

            <div className='flex items-center justify-center p-6'>
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2 font-medium">
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                    <img src="/images/logo_burguer.png" alt="Logo" className="h-9 w-9" />
                                </div>
                                <span className="sr-only">Entre na sua conta</span>
                            </div>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium text-neutral-100">Entre na sua conta</h1>
                                <p className="text-center text-sm text-neutral-300">Digite seu email e senha abaixo para fazer login</p>
                            </div>
                        </div>

                        <Head title="Log in" />

                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Endereço de email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@exemplo.com"
                                        className="bg-slate-800 border-slate-700 text-neutral-100"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Senha</Label>
                                        {canResetPassword && (
                                            <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                                Esqueceu a senha?
                                            </TextLink>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Senha"
                                        className="bg-slate-800 border-slate-700 text-neutral-100"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onClick={() => setData('remember', !data.remember)}
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">Lembrar de mim</Label>
                                </div>
                                <Button type="submit" className="mt-4 w-full bg-red-700 hover:bg-red-800" tabIndex={4} disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Entrar
                                </Button>
                            </div>
                            <div className="text-center text-sm text-neutral-400">
                                Não tem uma conta?{' '}
                                <TextLink href={route('register')} tabIndex={5}>
                                    Cadastre-se
                                </TextLink>
                            </div>
                        </form>
                        {status && <div className="mb-4 text-center text-sm font-medium text-green-400">{status}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
