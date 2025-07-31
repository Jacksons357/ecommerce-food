<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'tipo_usuario' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->command->info('Administrador criado com sucesso!');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Senha: password');
    }
}
