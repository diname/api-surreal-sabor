# Documentação Completa - Site Surreal Sabor

## Visão Geral do Projeto

Este projeto consiste em um site landing page completo para a empresa **Surreal Sabor**, desenvolvido com tecnologias modernas e preparado para produção. O sistema inclui uma landing page atrativa, painel administrativo completo e banco de dados integrado.

### Tecnologias Utilizadas

- **Frontend**: React 18 com Vite
- **Backend**: Node.js com Express
- **Banco de Dados**: SQLite (preparado para migração para PostgreSQL)
- **Estilização**: Tailwind CSS + shadcn/ui
- **Autenticação**: JWT (JSON Web Tokens)
- **Ícones**: Lucide React

## Estrutura do Projeto

### Backend (`/surreal-sabor-backend/`)
```
surreal-sabor-backend/
├── config/
│   └── database.js          # Configuração do banco SQLite
├── middleware/
│   └── auth.js              # Middleware de autenticação JWT
├── models/
│   ├── Admin.js             # Modelo de administradores
│   ├── Category.js          # Modelo de categorias
│   ├── Customer.js          # Modelo de clientes
│   └── Product.js           # Modelo de produtos
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── categories.js        # Rotas de categorias
│   ├── customers.js         # Rotas de clientes
│   └── products.js          # Rotas de produtos
├── uploads/                 # Imagens dos produtos
├── database/                # Banco de dados SQLite
├── .env                     # Variáveis de ambiente
├── package.json             # Dependências do backend
└── server.js                # Servidor principal
```

### Frontend (`/surreal-sabor-frontend/`)
```
surreal-sabor-frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx      # Login administrativo
│   │   │   └── AdminDashboard.jsx  # Painel administrativo
│   │   ├── ui/                     # Componentes UI (shadcn/ui)
│   │   ├── About.jsx               # Seção sobre a empresa
│   │   ├── CustomerForm.jsx        # Formulário de cadastro
│   │   ├── Footer.jsx              # Rodapé
│   │   ├── Header.jsx              # Cabeçalho/navegação
│   │   ├── Hero.jsx                # Seção hero
│   │   └── Products.jsx            # Listagem de produtos
│   ├── assets/                     # Imagens dos produtos
│   ├── App.jsx                     # Componente principal
│   ├── App.css                     # Estilos customizados
│   └── main.jsx                    # Ponto de entrada
├── index.html                      # HTML principal
└── package.json                    # Dependências do frontend
```

## Funcionalidades Implementadas

### Landing Page
- ✅ **Seção Hero**: Apresentação impactante com call-to-action
- ✅ **Nossa História**: Missão, valores e história da empresa
- ✅ **Produtos**: Listagem completa com filtros por categoria
- ✅ **Produtos em Destaque**: Seção especial para produtos destacados
- ✅ **Formulário de Cadastro**: Registro de clientes com validação
- ✅ **Design Responsivo**: Otimizado para desktop e mobile
- ✅ **Navegação Suave**: Scroll suave entre seções

### Painel Administrativo
- ✅ **Autenticação Segura**: Login com JWT
- ✅ **Dashboard**: Visão geral com estatísticas
- ✅ **Gerenciamento de Produtos**: CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ **Gerenciamento de Clientes**: Visualização de clientes cadastrados
- ✅ **Filtros e Categorias**: Organização por categorias
- ✅ **Interface Intuitiva**: Design moderno e fácil de usar

### Backend/API
- ✅ **API RESTful**: Endpoints organizados e documentados
- ✅ **Banco de Dados**: SQLite com estrutura preparada para PostgreSQL
- ✅ **Autenticação JWT**: Sistema seguro de autenticação
- ✅ **Validação de Dados**: Validação completa nos endpoints
- ✅ **CORS Configurado**: Preparado para diferentes origens
- ✅ **Middleware de Segurança**: Helmet para segurança adicional

## Banco de Dados

### Estrutura das Tabelas

#### Tabela `categories`
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela `products`
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### Tabela `customers`
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela `admins`
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Dados Iniciais

O sistema é inicializado com:
- **4 categorias**: Caldos e Sopas, Refeições Completas, Bebidas, Sobremesas
- **12 produtos**: Distribuídos entre as categorias com preços e descrições
- **1 administrador**: Usuário `admin` com senha `admin123`

## Credenciais de Acesso

### Painel Administrativo
- **URL**: `/admin`
- **Usuário**: `admin`
- **Senha**: `admin123`

## Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm instalado

### Backend
```bash
cd surreal-sabor-backend
npm install
npm start
```
O backend estará disponível em: `http://localhost:3001`

### Frontend
```bash
cd surreal-sabor-frontend
pnpm install
pnpm run dev
```
O frontend estará disponível em: `http://localhost:5173`

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do administrador
- `GET /api/auth/verify` - Verificar token JWT

### Produtos
- `GET /api/products` - Listar todos os produtos
- `GET /api/products/:id` - Buscar produto por ID
- `GET /api/products/category/:categoryId` - Produtos por categoria
- `GET /api/products/featured/list` - Produtos em destaque
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### Categorias
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Buscar categoria por ID
- `POST /api/categories` - Criar categoria (admin)
- `PUT /api/categories/:id` - Atualizar categoria (admin)
- `DELETE /api/categories/:id` - Deletar categoria (admin)

### Clientes
- `GET /api/customers` - Listar clientes (admin)
- `GET /api/customers/:id` - Buscar cliente por ID (admin)
- `POST /api/customers` - Cadastrar cliente (público)
- `PUT /api/customers/:id` - Atualizar cliente (admin)
- `DELETE /api/customers/:id` - Deletar cliente (admin)

### Health Check
- `GET /api/health` - Verificar status da API

## Migração para PostgreSQL

O projeto foi desenvolvido com SQLite mas está preparado para migração para PostgreSQL. Para migrar:

1. **Instalar dependência do PostgreSQL**:
```bash
npm install pg
```

2. **Atualizar configuração do banco** em `config/database.js`
3. **Ajustar queries** se necessário (a maioria é compatível)
4. **Configurar variáveis de ambiente** para PostgreSQL

## Deploy

### Frontend (Netlify/Vercel)
```bash
cd surreal-sabor-frontend
pnpm run build
# Upload da pasta dist/ para o serviço de hospedagem
```

### Backend (Railway/Heroku)
1. Configurar variáveis de ambiente
2. Ajustar porta para produção
3. Configurar banco de dados PostgreSQL
4. Deploy via Git

## Considerações de Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurado adequadamente
- ✅ Helmet para headers de segurança
- ✅ Sanitização de dados

## Melhorias Futuras

### Funcionalidades
- Sistema de pedidos online
- Integração com pagamento
- Sistema de avaliações
- Newsletter automática
- Chat de atendimento

### Técnicas
- Testes automatizados (Jest/Cypress)
- CI/CD pipeline
- Monitoramento e logs
- Cache com Redis
- CDN para imagens

## Suporte e Manutenção

### Logs
- Backend: Console logs estruturados
- Frontend: Console logs para debugging

### Backup
- Banco SQLite: Backup automático recomendado
- Imagens: Backup da pasta uploads/

### Monitoramento
- Health check endpoint disponível
- Logs de erro estruturados
- Métricas de performance recomendadas

---

**Desenvolvido com ❤️ para Surreal Sabor**
*Transformando cada refeição em um momento de puro prazer e bem-estar.*

