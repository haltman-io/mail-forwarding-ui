## API Endpoints (core)

### Authentication

- `POST /api/auth/sign-up`
- `POST /api/auth/verify-email`
- `POST /api/auth/sign-in`
- `GET /api/auth/session`
- `GET /api/auth/csrf`
- `POST /api/auth/refresh`
- `POST /api/auth/sign-out`
- `POST /api/auth/sign-out-all`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### `GET /api/forward/subscribe`
Request alias creation.

Query params:
- `name` (required)
- `to` (required)
- `domain` (optional; defaults to `DEFAULT_ALIAS_DOMAIN`)

### `GET /api/forward/confirm`
Preview a pending alias creation/removal request without consuming the token.

Query params:
- `token` (required)

### `POST /api/forward/confirm`
Apply the pending alias creation/removal request.

JSON body:
- `token` (required)

### `GET /api/forward/unsubscribe`
Request alias removal.

Query params:
- `alias` (required; full alias address)

### General public reads

- `GET /api/domains`
- `GET /api/stats`

### API credentials + alias management

- `POST /api/credentials/create` (body or query: `email`, `days`)
- `GET /api/credentials/confirm?token=...` (preview only)
- `POST /api/credentials/confirm` (JSON body: `token`)
- `GET /api/alias/list` (requires `X-API-Key`)
- `POST /api/alias/create` (requires `X-API-Key`)
- `POST /api/alias/delete` (requires `X-API-Key`)

## DNS (add your domain feature)

- `POST /api/request/ui` (JSON body: `{ "target": "example.com" }`)
- `POST /api/request/email` (JSON body: `{ "target": "example.com" }`)
- `GET /api/checkdns/:target`