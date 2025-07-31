import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contato() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-neutral-100">Entre em Contato</h1>
                <p className="text-neutral-300">Tem alguma dúvida? Estamos aqui para ajudar!</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Informações de contato */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações de Contato</CardTitle>
                        <CardDescription>Entre em contato conosco através dos canais abaixo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="font-medium text-neutral-100">Email</p>
                                <p className="text-sm text-neutral-400">contato@ecommerce.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="font-medium text-neutral-100">Telefone</p>
                                <p className="text-sm text-neutral-400">(11) 99999-9999</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="font-medium text-neutral-100">Endereço</p>
                                <p className="text-sm text-neutral-400">
                                    Rua das Flores, 123
                                    <br />
                                    São Paulo - SP, 01234-567
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulário de contato */}
                <Card>
                    <CardHeader>
                        <CardTitle>Envie uma Mensagem</CardTitle>
                        <CardDescription>Preencha o formulário abaixo e entraremos em contato</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" placeholder="Seu nome completo" />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="seu@email.com" />
                            </div>
                            <div>
                                <Label htmlFor="subject">Assunto</Label>
                                <Input id="subject" placeholder="Assunto da mensagem" />
                            </div>
                            <div>
                                <Label htmlFor="message">Mensagem</Label>
                                <Textarea id="message" placeholder="Digite sua mensagem aqui..." rows={4} />
                            </div>
                            <Button type="submit" className="w-full">
                                Enviar Mensagem
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
