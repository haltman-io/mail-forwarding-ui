# Front-End Auth/UI Adaptation Guide

This document is for the front-end developer who will adapt the current admin-only UI to the new back-end auth model.

## Summary

Before:

- only administrators could log in
- UI was focused on the admin login screen
- `POST /admin/login` existed

Now:

- common users can register
- common users can log in
- users can request password recovery
- admins and common users use the same login route
- the back-end returns `user.is_admin`
- `/admin/login` no longer exists
- admin routes still exist and are still protected in the back-end

## Main Back-End Changes

Use these routes now:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`

Admin routes still exist:

- `GET /admin/me`
- all other `/admin/*` routes

Important:

- the UI must not decide security
- the UI can decide what to display
- the back-end still decides who is allowed to access `/admin/*`

So the front-end should:

- read `user.is_admin`
- show admin UI only when `user.is_admin === true`
- still expect the server to reject non-admin requests to `/admin/*`

## New Login Response

Successful login now comes from `POST /auth/login`.

Example:

```json
{
  "ok": true,
  "action": "login",
  "user": {
    "id": 7,
    "email": "admin@example.com",
    "is_active": 1,
    "is_admin": true,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z",
    "last_login_at": "2026-03-13T11:00:00.000Z"
  },
  "auth": {
    "token": "bearer-token-here",
    "token_type": "bearer",
    "expires_at": "2026-03-13T22:00:00.000Z"
  }
}
```

This is the key field for the UI:

```json
{
  "user": {
    "is_admin": true
  }
}
```

## What The UI Should Do

### 1. Replace the old admin-only login flow

Old idea:

- email + password
- call `/admin/login`
- open admin dashboard

New idea:

- email + password
- call `/auth/login`
- save bearer token
- inspect `user.is_admin`
- if admin: show admin dashboard section
- if common user: show common user section

### 2. Add register UI

The UI should now have:

- login form
- register form
- forgot password form
- reset password form

The easiest UI adaptation is a single auth page with tabs or modes:

- `login`
- `register`
- `forgot password`
- `reset password`

### 3. Add a role-aware app shell

After login:

- store the token
- store the returned user object
- render navigation based on `user.is_admin`

Example:

- admin user: show `Dashboard`, `Users`, `Domains`, `Aliases`, `Handles`, `Bans`, `API Tokens`
- common user: hide admin navigation and show only common-user pages

If the common-user area does not exist yet, you can still:

- log them in successfully
- redirect them to a simple account page
- show basic profile info and a logout button

## Practical UI Example

### Login request

```ts
async function login(email: string, password: string) {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  localStorage.setItem("auth_token", data.auth.token);
  localStorage.setItem("auth_user", JSON.stringify(data.user));

  return data;
}
```

### Role-based redirect after login

```ts
const data = await login(email, password);

if (data.user.is_admin) {
  router.push("/admin");
} else {
  router.push("/app");
}
```

### Conditional admin menu

```tsx
function Sidebar({ user }: { user: { is_admin: boolean } }) {
  return (
    <nav>
      <a href="/app">Home</a>

      {user.is_admin && (
        <>
          <a href="/admin">Admin Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/domains">Domains</a>
          <a href="/admin/aliases">Aliases</a>
        </>
      )}
    </nav>
  );
}
```

## Session Restore On Page Reload

On app startup:

1. read the stored token
2. call `GET /auth/me`
3. if success, restore user session
4. if `401`, clear local auth data and redirect to login

Example:

```ts
async function restoreSession() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const res = await fetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    return null;
  }

  const data = await res.json();
  return data.user;
}
```

## How To Verify If The User Is Admin

Primary option:

- use `user.is_admin` from `POST /auth/login`

Safer restore option:

- use `user.is_admin` from `GET /auth/me`

Optional admin-specific verification:

- if the user enters the admin area, call `GET /admin/me`

Why this is useful:

- `GET /auth/me` confirms the user is authenticated
- `GET /admin/me` confirms the authenticated user is still an admin

Recommended UI behavior:

1. use `/auth/login` to authenticate
2. use `user.is_admin` to decide which UI shell to render
3. when entering admin pages, expect `/admin/*` routes to work only for admins
4. if `/admin/*` returns `403 { "error": "admin_required" }`, remove admin UI and redirect away

## Register Flow Example

### Request

```ts
await fetch("/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
  }),
});
```

### Success response

```json
{
  "ok": true,
  "created": true,
  "user": {
    "id": 12,
    "email": "user@example.com",
    "is_active": 1,
    "is_admin": false
  }
}
```

Important:

- registration creates common users only
- registration does not auto-login
- after register, redirect to login or auto-fill the email field

## Forgot Password Flow Example

### Request reset code

```ts
await fetch("/auth/password/forgot", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});
```

### Response

```json
{
  "ok": true,
  "action": "password_reset_request",
  "accepted": true,
  "recovery": {
    "ttl_minutes": 15
  }
}
```

Important UI behavior:

- always show the same success message
- do not show "email not found"

Recommended text:

> If the account exists, a recovery code was sent to the email address.

## Reset Password Flow Example

The email contains a 6-digit code.

The reset form should ask for:

- recovery code
- new password

### Request

```ts
await fetch("/auth/password/reset", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    token: code,
    new_password: newPassword,
  }),
});
```

### Success response

```json
{
  "ok": true,
  "action": "password_reset",
  "updated": true,
  "reauth_required": true,
  "sessions_revoked": 3,
  "user": {
    "id": 12,
    "email": "user@example.com"
  }
}
```

Important UI behavior:

- after successful password reset, redirect to login
- show a success message like "Password updated. Please log in again."
- do not try to keep the old token

## Recommended Front-End State Shape

Example:

```ts
type AuthState = {
  token: string | null;
  user: {
    id: number;
    email: string;
    is_admin: boolean;
    is_active: number;
    created_at?: string | null;
    updated_at?: string | null;
    last_login_at?: string | null;
  } | null;
};
```

## Error Handling Suggestions

### Login

- `400 invalid_params`: invalid form input
- `401 invalid_credentials`: show "invalid email or password"
- `429 rate_limited`: show retry message

### Register

- `400 invalid_params`
- `409 user_taken`: show "email already in use"

### Forgot password

- `400 invalid_params`
- `429 rate_limited`
- for `200 accepted`, always show generic success

### Reset password

- `400 invalid_token`
- `400 invalid_or_expired`
- `400 invalid_params` with `field: new_password`
- `503 temporarily_unavailable`

## UI Migration Checklist

- replace `/admin/login` with `/auth/login`
- add register UI using `/auth/register`
- add forgot password UI using `/auth/password/forgot`
- add reset password UI using `/auth/password/reset`
- store bearer token from `data.auth.token`
- restore session from `/auth/me`
- use `user.is_admin` to render admin navigation
- redirect admins to admin dashboard
- redirect common users to non-admin app area
- handle `403 admin_required` from `/admin/*`

## Final Recommendation

The simplest migration is:

1. keep the existing admin login screen layout
2. rename it to a generic auth page
3. add links for `Create account` and `Forgot password`
4. after login, branch on `user.is_admin`
5. if admin, show the administration dashboard section
6. if common user, show the normal authenticated area

That keeps the UI refactor small while matching the new back-end behavior.
