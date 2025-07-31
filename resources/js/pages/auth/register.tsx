import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const [showSuccessSpinner, setShowSuccessSpinner] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                setSuccessMessage('Conta criada com sucesso! Redirecionando...');
                setShowSuccessSpinner(true);

                // Esconde o spinner após 5 segundos
                setTimeout(() => {
                    setShowSuccessSpinner(false);
                    setSuccessMessage('');
                }, 5000);
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Se estiver mostrando o spinner de sucesso, renderiza apenas ele
    if (showSuccessSpinner) {
        return (
            <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
                <div className="hidden flex-col items-center justify-center bg-neutral-900 lg:flex">
                    <img src="/images/logo_burguer.png" alt="Logo" className="" />
                </div>

                <div className="flex items-center justify-center p-6">
                    <div className="w-full max-w-sm">
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                    <img src="/images/logo_burguer.png" alt="Logo" className="h-9 w-9" />
                                </div>
                            </div>

                            <div className="space-y-6 text-center">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <CheckCircle className="h-16 w-16 animate-pulse text-green-500" />
                                        <LoaderCircle className="absolute inset-0 m-auto h-20 w-20 animate-spin text-red-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="mb-2 text-xl font-medium text-neutral-100">Conta Criada!</h2>
                                    <p className="text-sm text-neutral-300">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
            <div className="hidden flex-col items-center justify-center bg-neutral-900 lg:flex">
                <img src="/images/logo_burguer.png" alt="Logo" className="" />
            </div>

            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2 font-medium">
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                    <img src="/images/logo_burguer.png" alt="Logo" className="h-9 w-9" />
                                </div>
                                <span className="sr-only">Criar uma conta</span>
                            </div>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium text-neutral-100">Criar uma conta</h1>
                                <p className="text-center text-sm text-neutral-300">Digite seus dados abaixo para criar sua conta</p>
                            </div>
                        </div>

                        <Head title="Register" />
                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Nome completo"
                                        className="border-slate-700 bg-slate-800 text-neutral-100"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Endereço de email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@exemplo.com"
                                        className="border-slate-700 bg-slate-800 text-neutral-100"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Senha"
                                        className="border-slate-700 bg-slate-800 text-neutral-100"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirmar senha</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirmar senha"
                                        className="border-slate-700 bg-slate-800 text-neutral-100"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button type="submit" className="mt-2 w-full bg-red-700 hover:bg-red-800" tabIndex={5} disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Criar conta
                                </Button>
                            </div>

                            <div className="text-center text-sm text-neutral-400">
                                Já tem uma conta?{' '}
                                <TextLink href={route('login')} tabIndex={6}>
                                    Entrar
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
