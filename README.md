# 🍔 Global Food - Ecommerce

Um sistema moderno e completo de gerenciamento de cardápio/produtos com funcionalidades específicas para clientes e administradores, desenvolvido com Laravel, React, TypeScript e TailwindCSS.

## 🎥 Demonstração

[![Demonstração do Sistema](https://img.youtube.com/vi/9624TN8PMPA/0.jpg)](https://www.youtube.com/watch?v=9624TN8PMPA)

**Clique na imagem acima para assistir a demonstração completa do sistema**

## ✨ Funcionalidades Principais

### 🏠 Tela Principal (Home)

- **Carrossel de Destaques**: Exibe produtos marcados como destaque do dia
- **Banners Promocionais**: Carrossel com imagens profissionais
- **Listagem de Produtos**: Grid responsivo com todos os produtos ativos
- **Adição ao Carrinho**: Botão direto para adicionar produtos

### 📄 Tela de Produtos (Cardápio)

- **Listagem Completa**: Todos os produtos com informações detalhadas
- **Filtros Visuais**: Badges para produtos em destaque
- **Interface Responsiva**: Adaptável para mobile e desktop
- **Integração com Carrinho**: Adição direta ao carrinho

### 🛒 Carrinho de Compras

- **Gestão de Itens**: Adicionar, remover e ajustar quantidades
- **Cálculo Automático**: Subtotal e total calculados em tempo real
- **Persistência**: Dados salvos no backend para usuários logados
- **Finalização de Pedido**: Processo completo com observações

### 🧑‍💼 Dashboard Administrativo

- **CRUD de Produtos**: Criar, editar, visualizar e deletar produtos
- **Upload de Imagens**: Sistema de upload com preview
- **Controle de Destaques**: Marcar/desmarcar produtos como destaque
- **Gestão de Status**: Ativar/desativar produtos
- **Busca e Filtros**: Pesquisa por nome e descrição

### 🔐 Sistema de Autenticação

- **Tipos de Usuário**: Cliente e Administrador
- **Controle de Acesso**: Middlewares específicos por tipo
- **Segurança**: Rotas protegidas e validações

## 🛠️ Tecnologias Utilizadas

### Backend

- **Laravel 12**: Framework PHP moderno
- **MySQL**: Banco de dados relacional
- **Eloquent ORM**: Mapeamento objeto-relacional
- **Inertia.js**: Integração SPA com Laravel

### Frontend

- **React 19**: Biblioteca JavaScript para interfaces
- **TypeScript**: Tipagem estática
- **TailwindCSS**: Framework CSS utilitário
- **Framer Motion**: Animações fluidas e responsivas
- **Radix UI**: Componentes acessíveis
- **Lucide React**: Ícones modernos

## 📋 Requisitos do Sistema

### Servidor

- **PHP**: 8.2 ou superior
- **Composer**: Gerenciador de dependências PHP
- **MySQL**: 8.0 ou superior
- **Node.js**: 18.0 ou superior
- **npm**: Gerenciador de pacotes Node.js

### Extensões PHP

- BCMath PHP Extension
- Ctype PHP Extension
- cURL PHP Extension
- DOM PHP Extension
- Fileinfo PHP Extension
- JSON PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PCRE PHP Extension
- PDO PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/Jacksons357/food-ecommerce.git
cd food-ecommerce
```

### 2. Instale as Dependências PHP

```bash
composer install
```

### 3. Instale as Dependências Node.js

```bash
npm install
```

### 4. Configure o Ambiente

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configure o Banco de Dados

Edite o arquivo `.env` com suas configurações de banco:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cardapio_db
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### 6. Execute as Migrações e Seeders

```bash
php artisan migrate:fresh --seed
```

### 7. Crie o Link Simbólico do Storage

```bash
php artisan storage:link
```

### 8. Compile os Assets

```bash
npm run build
```

### 9. Inicie o Servidor de Desenvolvimento

```bash
# Rodar os dois terminais PHP e NPM
composer run dev

```

## 👤 Criando as contas

O sistema já vem com um administrador padrão criado pelo seeder:

**Credenciais:**

- **Email**: admin@example.com
- **Senha**: password

O sistema já vem com um cliente padrão criado pelo seeder:

**Credenciais:**

- **Email**: test@example.com
- **Senha**: password

### Para criar via Seeder:

```bash
php artisan db:seed --class=AdminSeeder
```

## 📁 Estrutura do Projeto

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── HomeController.php          # Página inicial
│   │   ├── ProdutoController.php       # CRUD de produtos (admin)
│   │   ├── CarrinhoController.php      # Gestão do carrinho
│   │   └── PedidoController.php        # Gestão de pedidos
│   └── Middleware/
│       ├── AdminMiddleware.php         # Controle de acesso admin
│       └── ClienteMiddleware.php       # Controle de acesso cliente
├── Models/
│   ├── User.php                        # Modelo de usuário
│   ├── Produto.php                     # Modelo de produto
│   ├── Carrinho.php                    # Modelo de carrinho
│   ├── CarrinhoItem.php                # Modelo de item do carrinho
│   ├── Pedido.php                      # Modelo de pedido
│   └── PedidoItem.php                  # Modelo de item do pedido
└── ...

resources/js/
├── pages/
│   ├── Home.tsx                        # Página inicial
│   ├── Produtos/
│   │   └── Index.tsx                   # Listagem de produtos
│   ├── Carrinho/
│   │   └── Index.tsx                   # Carrinho de compras
│   └── Admin/
│       └── Produtos/
│           ├── Index.tsx               # Listagem admin
│           └── Create.tsx              # Criação de produtos
└── components/ui/                      # Componentes reutilizáveis
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `users`

- `id` - Chave primária
- `name` - Nome do usuário
- `email` - Email único
- `password` - Senha criptografada
- `tipo_usuario` - 'cliente' ou 'admin'
- `email_verified_at` - Data de verificação
- `created_at`, `updated_at` - Timestamps

#### `produtos`

- `id` - Chave primária
- `nome` - Nome do produto
- `descricao` - Descrição detalhada
- `preco` - Preço em decimal
- `imagem` - Caminho da imagem
- `destaque_dia` - Boolean para destaque
- `ativo` - Boolean para status
- `created_at`, `updated_at` - Timestamps

#### `carrinhos`

- `id` - Chave primária
- `usuario_id` - FK para users
- `created_at`, `updated_at` - Timestamps

#### `carrinho_items`

- `id` - Chave primária
- `carrinho_id` - FK para carrinhos
- `produto_id` - FK para produtos
- `quantidade` - Quantidade do item
- `preco_unitario` - Preço no momento da adição
- `created_at`, `updated_at` - Timestamps

#### `pedidos`

- `id` - Chave primária
- `usuario_id` - FK para users
- `total` - Valor total do pedido
- `status` - Status do pedido
- `observacoes` - Observações do cliente
- `created_at`, `updated_at` - Timestamps

#### `pedido_items`

- `id` - Chave primária
- `pedido_id` - FK para pedidos
- `produto_id` - FK para produtos
- `quantidade` - Quantidade do item
- `preco_unitario` - Preço no momento do pedido
- `created_at`, `updated_at` - Timestamps

## 🎨 Personalização

### Cores e Tema

O sistema utiliza uma paleta de cores baseada em laranja e vermelho. Para personalizar:

1. Edite o arquivo `tailwind.config.js`
2. Modifique as cores no arquivo `resources/css/app.css`
3. Atualize os componentes conforme necessário

## 🔧 Comandos Úteis

### Banco de Dados

```bash
# Executar migrações
php artisan migrate

# Reverter migrações
php artisan migrate:rollback

# Executar seeders
php artisan db:seed

# Reset completo do banco
php artisan migrate:fresh --seed
```

### Variáveis de Ambiente Importantes

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-dominio.com
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cardapio_db
DB_USERNAME=usuario_db
DB_PASSWORD=senha_db
```

**Desenvolvido com ❤️**
