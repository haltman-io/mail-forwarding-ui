# Admin API Routes Guide

Este documento descreve as rotas novas do conjunto `/admin` para um dashboard frontend.
Ele cobre autenticação, headers, payloads, respostas, erros e regras importantes de comportamento.

## 1) Visão geral

Base path: `/admin`

Fluxo esperado:
1. Frontend faz login em `POST /admin/login`.
2. Recebe `auth.token`.
3. Envia o token nas próximas chamadas.
4. Pode validar sessão atual em `GET /admin/me`.

Não existe rota de auto-cadastro para admin.

## 2) Autenticação e autorização

As rotas autenticadas aceitam token por:

1. Header `Authorization: Bearer <token_hex>`
2. Ou header `X-Admin-Token: <token_hex>`

Se faltar token:

```json
{
  "error": "missing_admin_token"
}
```

Se token inválido/expirado/revogado:

```json
{
  "error": "invalid_or_expired_admin_token"
}
```

Formato inválido de token:

```json
{
  "error": "invalid_admin_token_format"
}
```

## 3) Convenções comuns de payload e query

### 3.1 Paginação

Em rotas de listagem:

- Query `limit` (default 50, max 200)
- Query `offset` (default 0)

Resposta:

```json
{
  "items": [],
  "pagination": {
    "total": 0,
    "limit": 50,
    "offset": 0
  }
}
```

### 3.2 Booleanos flexíveis

Campos como `active`, `is_active`, `revoked` aceitam:

- `true`, `false`
- `1`, `0`
- `"true"`, `"false"`
- `"yes"`, `"no"`
- `"on"`, `"off"`

### 3.3 Datas

Quando uma rota aceita data (`expires_at`), envie formato ISO 8601.

Exemplo:

```json
{
  "expires_at": "2026-03-30T12:00:00.000Z"
}
```

### 3.4 Erros de validação

Padrão:

```json
{
  "error": "invalid_params",
  "field": "nome_do_campo"
}
```

Pode incluir `reason` ou `hint` dependendo da rota.

### 3.5 Erro interno

```json
{
  "error": "internal_error"
}
```

### 3.6 Banimentos globais (`api_bans`)

Regras ativas:

- `ip`: bloqueia **qualquer rota** (`admin`, `api`, `forward`, `request/*`, `domains`).
- `email`: bloqueia uso de e-mail banido como destino (`goto`/`address` de destino).
- `domain`: bloqueia domínio banido (incluindo sufixo), impedindo uso em alias, destino e cadastro de domínio.
- `name`: bloqueia criação/atualização de alias/handle com esse local-part.

Resposta padrão quando bloqueado:

```json
{
  "error": "banned",
  "ban": {
    "ban_type": "domain",
    "ban_value": "example.com",
    "reason": "abuse",
    "banned_at": "2026-02-23T12:00:00.000Z"
  }
}
```

## 4) Rotas de autenticação admin

### 4.1 `POST /admin/login`

Autentica admin por e-mail e senha.

Body:

```json
{
  "email": "admin@example.com",
  "password": "SUA_SENHA"
}
```

Sucesso `200`:

```json
{
  "ok": true,
  "action": "admin_login",
  "admin": {
    "email": "admin@example.com"
  },
  "auth": {
    "token": "hex_token",
    "token_type": "bearer",
    "expires_at": "2026-02-24T01:00:00.000Z"
  }
}
```

Erros comuns:

- `400 invalid_params` (`email` ou `password`)
- `401 invalid_credentials`
- `403 banned` (IP banido)
- `429 rate_limited` quando detectar brute-force (falhas repetidas)

Exemplo de resposta `429`:

```json
{
  "error": "rate_limited",
  "where": "admin_login",
  "reason": "too_many_failed_attempts_email_ip"
}
```

Razões possíveis de `429` em login:

- `too_many_failed_attempts_email_ip` (detecção rápida)
- `too_many_failed_attempts_email_ip_heavy` (punição pesada)
- `too_many_failed_attempts_email`
- `too_many_failed_attempts_ip`

Observação:

- Login bem-sucedido envia e-mail de notificação ao admin (quando habilitado via env).

### 4.2 `GET /admin/me` (nova rota auxiliar)

Valida se token atual está autenticado e retorna dados comuns do admin logado.

Requer token.

Sucesso `200`:

```json
{
  "ok": true,
  "authenticated": true,
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "is_active": 1,
    "created_at": "2026-02-20T11:00:00.000Z",
    "updated_at": "2026-02-23T14:00:00.000Z",
    "last_login_at": "2026-02-23T16:00:00.000Z"
  },
  "auth": {
    "session_id": 15,
    "token_type": "bearer",
    "expires_at": "2026-02-24T01:00:00.000Z"
  }
}
```

Erros comuns:

- `401 missing_admin_token`
- `401 invalid_or_expired_admin_token`

Uso no frontend:

- Chamar no boot da aplicação para validar sessão.
- Se `401`, limpar token local e redirecionar para tela de login.

## 5) CRUD Admin: Domains

### 5.1 `GET /admin/domains`

Query opcional:

- `active`
- `limit`
- `offset`

Retorna lista da tabela `domain` (`id`, `name`, `active`).

### 5.2 `GET /admin/domains/:id`

Retorna um domínio:

```json
{
  "item": {
    "id": 10,
    "name": "example.com",
    "active": 1
  }
}
```

Erros:

- `404 domain_not_found`

### 5.3 `POST /admin/domains`

Body:

```json
{
  "name": "example.com",
  "active": 1
}
```

Sucesso `201`: `{ "ok": true, "created": true, "item": ... }`

Erros:

- `409 domain_taken`
- `403 banned` (domínio banido)

### 5.4 `PATCH /admin/domains/:id`

Body parcial:

```json
{
  "name": "novo-dominio.com",
  "active": 1
}
```

Sucesso `200`: `{ "ok": true, "updated": true, "item": ... }`

Erros comuns:

- `409 domain_taken`
- `403 banned` (domínio banido, inclusive em reativação)

### 5.5 `DELETE /admin/domains/:id`

Soft delete (`active = 0`).

Sucesso `200`:

```json
{
  "ok": true,
  "deleted": true,
  "item": {
    "id": 10,
    "name": "example.com",
    "active": 0
  }
}
```

## 6) CRUD Admin: Aliases

Tabela alvo `alias`.

### 6.1 `GET /admin/aliases`

Query opcional:

- `active`
- `goto`
- `domain`
- `handle`
- `address`
- `limit`
- `offset`

Campos de retorno por item:

- `id`
- `address`
- `goto`
- `active`
- `domain_id`
- `created`
- `modified`

### 6.2 `GET /admin/aliases/:id`

Retorna alias por id.

Erro:

- `404 alias_not_found`

### 6.3 `POST /admin/aliases`

Body:

```json
{
  "address": "john@example.com",
  "goto": "destino@pm.me",
  "active": 1
}
```

Regras:

- domínio do `address` precisa existir e estar ativo
- handle reservado em `alias_handle` bloqueia criação
- aplica bans de `name` e `domain` no alias, e `email`/`domain` no destino (`goto`)

Erros comuns:

- `400 invalid_domain`
- `409 alias_taken`
- `403 banned`

### 6.4 `PATCH /admin/aliases/:id`

Body parcial:

```json
{
  "address": "john2@example.com",
  "goto": "novo@pm.me",
  "active": 1
}
```

Revalida conflitos e domínio ativo ao trocar `address`.
Também revalida bans ao alterar `address`/`goto` ou reativar (`active=1`).

### 6.5 `DELETE /admin/aliases/:id`

Soft delete (`active = 0`).

## 7) CRUD Admin: Bans

Tabela alvo `api_bans`.

Tipos aceitos:

- `email`
- `domain`
- `ip`
- `name`

### 7.1 `GET /admin/bans`

Query opcional:

- `ban_type`
- `ban_value`
- `active`
- `limit`
- `offset`

Cada item inclui `active` calculado pela API.

### 7.2 `GET /admin/bans/:id`

Retorna item + `active` calculado.

Erro:

- `404 ban_not_found`

### 7.3 `POST /admin/bans`

Body:

```json
{
  "ban_type": "email",
  "ban_value": "user@example.com",
  "reason": "abuse",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

### 7.4 `PATCH /admin/bans/:id`

Body parcial possível:

- `ban_type`
- `ban_value`
- `reason`
- `expires_at`
- `revoked` (0/1)
- `revoked_reason`

### 7.5 `DELETE /admin/bans/:id`

Delete semântico: revoga o ban.

Body opcional:

```json
{
  "revoked_reason": "manual cleanup"
}
```

## 8) CRUD Admin: Handles (catch-all)

Tabela alvo `alias_handle`.

Semântica:

- `handle` representa apenas a parte local.
- Se existir `handle=admin1` ativo, ele age como regra catch-all para `admin1@*`.
- Destino de encaminhamento está em `address`.

### 8.1 `GET /admin/handles`

Query opcional:

- `active`
- `handle`
- `address`
- `limit`
- `offset`

Retorno por item:

- `id`
- `handle`
- `address` (email destino)
- `active`

### 8.2 `GET /admin/handles/:id`

Erro:

- `404 handle_not_found`

### 8.3 `POST /admin/handles`

Body:

```json
{
  "handle": "admin1",
  "address": "destino@pm.me",
  "active": 1
}
```

Erros comuns:

- `400 invalid_params` (`handle`, `address`, `active`)
- `409 handle_taken`
- `403 banned` (`name` banido ou destino `email/domain` banido)

### 8.4 `PATCH /admin/handles/:id`

Body parcial:

```json
{
  "handle": "admin2",
  "address": "novo@pm.me",
  "active": 0
}
```

Erros comuns:

- `404 handle_not_found`
- `409 handle_taken`
- `403 banned`

### 8.5 `DELETE /admin/handles/:id`

Soft delete (`active = 0`).

## 9) CRUD Admin: API Tokens

Tabela alvo `api_tokens`.

### 8.1 `GET /admin/api-tokens`

Query opcional:

- `owner_email`
- `status` (`active`, `revoked`, `expired`)
- `active` (calculado por status + revoked_at + expires_at)
- `limit`
- `offset`

Cada item retorna:

- `id`
- `owner_email`
- `token_hash` (hex)
- `status`
- `created_at`
- `expires_at`
- `revoked_at`
- `revoked_reason`
- `created_ip`
- `user_agent`
- `last_used_at`
- `active` (calculado)

### 8.2 `GET /admin/api-tokens/:id`

Retorna token por id + `active`.

Erro:

- `404 api_token_not_found`

### 8.3 `POST /admin/api-tokens`

Body:

```json
{
  "owner_email": "owner@example.com",
  "days": 30
}
```

`days` é opcional (default 30, faixa 1..90).

Sucesso `201` inclui token em texto plano (apenas nesse momento):

```json
{
  "ok": true,
  "created": true,
  "token": "plaintext_token_hex",
  "token_type": "api_key",
  "item": {
    "id": 1,
    "owner_email": "owner@example.com",
    "token_hash": "HEX...",
    "status": "active",
    "created_at": "2026-02-23T16:00:00.000Z",
    "expires_at": "2026-03-24T16:00:00.000Z",
    "revoked_at": null,
    "revoked_reason": null,
    "created_ip": "127.0.0.1",
    "user_agent": "Mozilla/5.0",
    "last_used_at": null,
    "active": true
  }
}
```

### 8.4 `PATCH /admin/api-tokens/:id`

Body parcial:

- `owner_email`
- `status`
- `expires_at`
- `revoked` (0/1)
- `revoked_reason`

Erro específico:

- `400 invalid_params` com `reason: "status_revoked_conflict"`

### 8.5 `DELETE /admin/api-tokens/:id`

Delete semântico: revoga token.

Body opcional:

```json
{
  "revoked_reason": "security incident"
}
```

## 10) CRUD Admin: Admin Users

Tabela alvo `admin_users`.

Observação importante:

- Create/update/delete/password change enviam e-mail de notificação ao(s) admin(s) afetado(s).
- Read/list não envia notificação.

### 9.1 `GET /admin/users`

Query opcional:

- `active` (campo `is_active`)
- `email`
- `limit`
- `offset`

Item retornado:

- `id`
- `email`
- `is_active`
- `created_at`
- `updated_at`
- `last_login_at`

### 9.2 `GET /admin/users/:id`

Retorna admin por id.

Erro:

- `404 admin_user_not_found`

### 9.3 `POST /admin/users`

Body:

```json
{
  "email": "admin2@example.com",
  "password": "SenhaForteAqui",
  "is_active": 1
}
```

Erros comuns:

- `409 admin_user_taken`
- `409 cannot_disable_last_admin` (ao tentar deixar o sistema sem nenhum admin ativo)

### 9.4 `PATCH /admin/users/:id`

Body parcial:

- `email`
- `is_active`
- `password` (permitido para alterar senha de outro admin)

Regra:

- Se tentar alterar sua própria senha por esta rota, retorna:

```json
{
  "error": "invalid_params",
  "field": "password",
  "reason": "use_self_password_route"
}
```

### 9.5 `DELETE /admin/users/:id`

Soft delete (`is_active = 0`) + revoga sessões do usuário alvo.

Erro comum:

- `409 cannot_disable_last_admin` (não permite remover/desativar o último admin ativo)

### 9.6 `PATCH /admin/users/me/password`

Troca senha do admin autenticado.

Body:

```json
{
  "current_password": "SenhaAtual",
  "new_password": "SenhaNovaForte"
}
```

Regras:

- `current_password` precisa ser válida.
- `new_password` não pode ser igual à atual.
- após troca, sessões anteriores são revogadas.
- frontend deve forçar relogin.

Sucesso:

```json
{
  "ok": true,
  "updated": true,
  "reauth_required": true,
  "sessions_revoked": 2
}
```

## 11) Mapa rápido de rotas

Rotas sem autenticação:

- `POST /admin/login`

Rotas com autenticação admin:

- `GET /admin/me`
- `GET /admin/domains`
- `GET /admin/domains/:id`
- `POST /admin/domains`
- `PATCH /admin/domains/:id`
- `DELETE /admin/domains/:id`
- `GET /admin/aliases`
- `GET /admin/aliases/:id`
- `POST /admin/aliases`
- `PATCH /admin/aliases/:id`
- `DELETE /admin/aliases/:id`
- `GET /admin/handles`
- `GET /admin/handles/:id`
- `POST /admin/handles`
- `PATCH /admin/handles/:id`
- `DELETE /admin/handles/:id`
- `GET /admin/bans`
- `GET /admin/bans/:id`
- `POST /admin/bans`
- `PATCH /admin/bans/:id`
- `DELETE /admin/bans/:id`
- `GET /admin/api-tokens`
- `GET /admin/api-tokens/:id`
- `POST /admin/api-tokens`
- `PATCH /admin/api-tokens/:id`
- `DELETE /admin/api-tokens/:id`
- `GET /admin/users`
- `GET /admin/users/:id`
- `POST /admin/users`
- `PATCH /admin/users/:id`
- `DELETE /admin/users/:id`
- `PATCH /admin/users/me/password`

## 12) Sugestão prática para dashboard frontend

1. Tela de login:
`POST /admin/login` e guardar token.

2. Bootstrap de sessão:
`GET /admin/me` ao iniciar app.

3. Interceptor HTTP:
injetar `Authorization: Bearer <token>` em chamadas `/admin/*`.

4. Tratamento global de `401`:
limpar sessão local e redirecionar para login.

5. Tabelas paginadas:
usar sempre `limit/offset` e refletir `pagination.total`.

6. Fluxo de segurança:
após `PATCH /admin/users/me/password`, invalidar sessão local e abrir login.
