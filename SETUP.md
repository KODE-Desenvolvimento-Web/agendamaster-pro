# AgendaMaster Pro - Guia de Instalação

Sistema SaaS Multi-tenant de Agendamentos construído com React, TypeScript, Tailwind CSS e Supabase.

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- Conta no [Supabase](https://supabase.com)
- (Opcional) Conta no [Resend](https://resend.com) para e-mails
- (Opcional) Instância [Evolution API](https://evolution-api.com) para WhatsApp

## 🚀 Instalação Rápida

### 1. Clone e Instale Dependências

```bash
# Clone o repositório
git clone <seu-repositorio>
cd agendamaster-pro

# Instale as dependências
npm install
# ou
bun install
```

### 2. Configure o Supabase

#### 2.1 Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde a inicialização do projeto
3. Vá em **Settings > API** e copie:
   - `Project URL`
   - `anon/public key`

#### 2.2 Execute os Scripts SQL

No **SQL Editor** do Supabase, execute os arquivos na ordem:

1. `supabase/setup/01_schema.sql` - Cria as tabelas
2. `supabase/setup/02_functions.sql` - Cria funções e triggers
3. `supabase/setup/03_rls_policies.sql` - Configura segurança RLS
4. `supabase/setup/04_seed.sql` - (Opcional) Dados de exemplo

#### 2.3 Crie o Primeiro Usuário Admin

1. Vá em **Authentication > Users** e clique em **Add user**
2. Crie um usuário com e-mail e senha
3. Copie o **User UID**
4. Execute no SQL Editor:

```sql
-- Substitua YOUR_USER_ID pelo UUID do usuário criado
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'super_admin');

INSERT INTO public.profiles (user_id, full_name)
VALUES ('YOUR_USER_ID', 'Administrador');
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

### 4. Deploy das Edge Functions

#### 4.1 Instale o Supabase CLI

```bash
npm install -g supabase
```

#### 4.2 Faça Login e Link

```bash
supabase login
supabase link --project-ref seu-project-id
```

#### 4.3 Configure os Secrets

```bash
# WhatsApp (Evolution API)
supabase secrets set EVOLUTION_API_URL=https://sua-instancia.com
supabase secrets set EVOLUTION_API_KEY=sua-api-key
supabase secrets set EVOLUTION_INSTANCE=nome-da-instancia

# E-mail (Resend) - Opcional
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set RESEND_FROM_EMAIL=noreply@seudominio.com
```

#### 4.4 Deploy das Functions

```bash
supabase functions deploy check-booking
supabase functions deploy send-notifications
supabase functions deploy manage-users
```

### 5. Inicie o Projeto

```bash
npm run dev
# ou
bun dev
```

Acesse: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/        # Componentes React
│   ├── contexts/          # Context providers (Auth, Theme)
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # Configuração Supabase
│   ├── pages/             # Páginas da aplicação
│   └── lib/               # Utilitários
├── supabase/
│   ├── functions/         # Edge Functions
│   │   ├── check-booking/
│   │   ├── send-notifications/
│   │   └── manage-users/
│   ├── setup/             # Scripts SQL de instalação
│   └── config.toml        # Configuração das functions
└── public/                # Assets estáticos
```

## 🔐 Níveis de Acesso

| Role | Permissões |
|------|------------|
| `super_admin` | Acesso total ao sistema, gerencia todas as organizações |
| `org_admin` | Gerencia sua organização (serviços, staff, clientes) |
| `staff` | Agenda e gerencia seus atendimentos |
| `customer` | Visualiza e agenda seus próprios serviços |

## 🔧 Edge Functions

### check-booking
Verifica disponibilidade e previne double-booking.

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/check-booking \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "uuid",
    "staff_id": "uuid",
    "scheduled_at": "2024-01-15T10:00:00Z",
    "duration": 30
  }'
```

### send-notifications
Processa fila de notificações (WhatsApp/E-mail).

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/send-notifications \
  -H "Content-Type: application/json" \
  -d '{"batch_size": 10}'
```

### manage-users
Gerenciamento de usuários (criação via admin).

## 📱 Configuração WhatsApp (Evolution API)

1. Instale a Evolution API em um servidor ou use um provedor
2. Crie uma instância e conecte seu WhatsApp
3. Configure os secrets:
   - `EVOLUTION_API_URL`: URL da sua instância
   - `EVOLUTION_API_KEY`: Sua API key
   - `EVOLUTION_INSTANCE`: Nome da instância

## 📧 Configuração E-mail (Resend)

1. Crie uma conta em [resend.com](https://resend.com)
2. Verifique seu domínio
3. Crie uma API key
4. Configure os secrets:
   - `RESEND_API_KEY`: Sua API key
   - `RESEND_FROM_EMAIL`: E-mail de envio verificado

## 🔄 Processamento Automático de Notificações

Para processar notificações automaticamente, configure um cron job:

```sql
-- No SQL Editor do Supabase, habilite pg_cron e pg_net
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agende o processamento a cada minuto
SELECT cron.schedule(
  'process-notifications',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/send-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SUA_ANON_KEY"}'::jsonb,
    body := '{"batch_size": 10}'::jsonb
  );
  $$
);
```

## 🐛 Troubleshooting

### Erro de RLS Policy
- Verifique se o usuário tem a role correta em `user_roles`
- Confirme que as policies foram criadas corretamente

### Edge Function não responde
- Verifique os logs: `supabase functions logs nome-da-funcao`
- Confirme que os secrets estão configurados

### WhatsApp não envia
- Verifique se a instância Evolution está conectada
- Confirme o formato do número (55 + DDD + número)

## 📄 Licença

MIT License
