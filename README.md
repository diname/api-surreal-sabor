# 🍽️ Surreal Sabor - Landing Page

> **Comida Caseira com Sabor Inconfundível**

Site landing page completo para a empresa Surreal Sabor, desenvolvido com React e Node.js, incluindo painel administrativo e sistema de cadastro de clientes.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Autenticação**: JWT
- **UI Components**: shadcn/ui

## 📋 Funcionalidades

### Landing Page
- ✅ Seção Hero com apresentação da empresa
- ✅ História, missão e valores
- ✅ Catálogo de produtos com filtros
- ✅ Formulário de cadastro de clientes
- ✅ Design responsivo

### Painel Administrativo
- ✅ Login seguro com JWT
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de produtos
- ✅ Gerenciamento de clientes
- ✅ Sistema de categorias

## 🏃‍♂️ Como Executar

### Backend
```bash
cd surreal-sabor-backend
npm install
npm start
```
**Servidor**: http://localhost:3001

### Frontend
```bash
cd surreal-sabor-frontend
pnpm install
pnpm run dev
```
**Site**: http://localhost:5173

## 🔐 Credenciais de Teste

**Painel Admin**: `/admin`
- **Usuário**: `admin`
- **Senha**: `admin123`

## 📁 Estrutura do Projeto

```
├── surreal-sabor-backend/     # API Node.js
│   ├── config/               # Configurações
│   ├── models/               # Modelos do banco
│   ├── routes/               # Rotas da API
│   ├── middleware/           # Middlewares
│   └── uploads/              # Imagens dos produtos
│
├── surreal-sabor-frontend/    # App React
│   ├── src/components/       # Componentes React
│   ├── src/assets/           # Imagens e assets
│   └── src/                  # Código fonte
│
└── DOCUMENTACAO_COMPLETA.md   # Documentação detalhada
```

## 🗄️ Banco de Dados

**SQLite** (preparado para migração PostgreSQL)
- Produtos com categorias
- Clientes cadastrados
- Administradores
- Sistema de autenticação

## 🌐 Deploy

### Frontend
```bash
cd surreal-sabor-frontend
pnpm run build
# Upload da pasta dist/ para Netlify/Vercel
```

### Backend
- Configure PostgreSQL em produção
- Ajuste variáveis de ambiente
- Deploy no Railway/Heroku

## 📖 Documentação

Consulte `DOCUMENTACAO_COMPLETA.md` para:
- Guia detalhado de instalação
- Documentação da API
- Estrutura do banco de dados
- Instruções de deploy
- Considerações de segurança

## 🎯 Próximos Passos

- [ ] Sistema de pedidos online
- [ ] Integração com pagamento
- [ ] Testes automatizados
- [ ] CI/CD pipeline

---

**Desenvolvido para Surreal Sabor** 🧡
*Transformando cada refeição em um momento especial*

