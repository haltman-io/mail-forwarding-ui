/**
 * dev-proxy.js
 *
 * Proxy local de mesma origem para desenvolvimento:
 * - /api/**  -> host remoto real (ex.: https://app.example.com)
 * - todo o resto -> Next.js dev server local (ex.: http://127.0.0.1:3000)
 *
 * OBJETIVO:
 * - evitar CORS no navegador
 * - não alterar backend de produção
 * - manter /api relativo no front
 *
 * IMPORTANTE:
 * - abra o app em http://localhost:3100
 * - NÃO abra http://localhost:3000 direto no navegador
 * - mantenha o front chamando /api/... de forma relativa
 *
 * Dependência:
 *   npm i http-proxy
 *
 * Execução:
 *   node dev-proxy.js
 *
 * Observação:
 * - se seu projeto usar "type": "module" e este arquivo der erro com require,
 *   renomeie para dev-proxy.cjs
 */

const http = require("node:http");
const httpProxy = require("http-proxy");
const { URL } = require("node:url");

/* =========================
 * CONFIGURAÇÃO
 * ========================= */

// onde o proxy local vai ouvir
const LOCAL_BIND_HOST = "127.0.0.1";
const LOCAL_PUBLIC_HOST = "localhost";
const LOCAL_PORT = 3100;

// next dev local
const NEXT_DEV_TARGET = "http://127.0.0.1:3000";

// host remoto real que já funciona em produção
const REMOTE_APP_TARGET = "https://mail.thc.org";

// prefixo da API
const API_PREFIX = "/api";

// timeouts
const REQUEST_TIMEOUT_MS = 120_000;
const PROXY_TIMEOUT_MS = 120_000;

// logs
const LOG_HEADERS = false;
const LOG_WEBSOCKET_UPGRADES = true;
const LOG_SET_COOKIE_NAMES_ONLY = true;

// reescrita de headers da chamada para a API remota
const REWRITE_API_REQUEST_HOST = true;
const REWRITE_API_REQUEST_ORIGIN = true;
const REWRITE_API_REQUEST_REFERER = true;

// reescrever redirects absolutos para o browser continuar preso no proxy local
const REWRITE_REDIRECT_LOCATION_HEADERS = true;

// cookies
// "off"     = não mexe no Domain
// "strip"   = remove Domain do Set-Cookie (vira host-only cookie; geralmente o melhor para localhost)
// "replace" = troca Domain por SET_COOKIE_DOMAIN_REPLACEMENT
//const REWRITE_SET_COOKIE_DOMAIN_MODE = "strip";
const REWRITE_SET_COOKIE_DOMAIN_MODE = "off";
const SET_COOKIE_DOMAIN_REPLACEMENT = "localhost";

// se o backend remoto usa cookies Secure e você roda o proxy local em HTTP,
// o navegador pode ignorar esses cookies.
// estas flags são DEV ONLY.
//const STRIP_SECURE_COOKIE_FLAG = true;
const STRIP_SECURE_COOKIE_FLAG = false;
//const REWRITE_SAMESITE_NONE_TO_LAX = true;
const REWRITE_SAMESITE_NONE_TO_LAX = false;

// opcional: limpar headers CORS da resposta remota
const REMOVE_CORS_RESPONSE_HEADERS = false;

// x-forwarded-*
const ENABLE_X_FORWARDED_HEADERS = false;

// verificação TLS do alvo remoto
const VERIFY_REMOTE_TLS = true;

/* =========================
 * DERIVADOS
 * ========================= */

const LOCAL_PUBLIC_ORIGIN = `http://${LOCAL_PUBLIC_HOST}:${LOCAL_PORT}`;
const NEXT_DEV_ORIGIN = new URL(NEXT_DEV_TARGET).origin;
const REMOTE_APP_ORIGIN = new URL(REMOTE_APP_TARGET).origin;

/* =========================
 * HELPERS
 * ========================= */

function ts() {
  return new Date().toISOString();
}

function log(level, message, extra) {
  if (extra !== undefined) {
    console.log(`[${ts()}] [${level}] ${message}`, extra);
    return;
  }
  console.log(`[${ts()}] [${level}] ${message}`);
}

function warnIfUnsafeBind() {
  if (LOCAL_BIND_HOST === "0.0.0.0" || LOCAL_BIND_HOST === "::") {
    log(
      "WARN",
      `O proxy está configurado para ouvir em ${LOCAL_BIND_HOST}. Para desenvolvimento seguro, prefira 127.0.0.1.`
    );
  }
}

function sanitizeHeaders(headers) {
  const out = { ...headers };

  if (out.cookie) out.cookie = "[hidden]";
  if (out.authorization) out.authorization = "[hidden]";
  if (out["proxy-authorization"]) out["proxy-authorization"] = "[hidden]";
  if (out["set-cookie"]) out["set-cookie"] = summarizeSetCookies(out["set-cookie"]);

  return out;
}

function summarizeSetCookies(setCookieHeader) {
  if (!setCookieHeader) return [];

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  return cookies.map((cookie) => {
    const name = String(cookie).split("=")[0]?.trim() || "<unknown>";
    return LOG_SET_COOKIE_NAMES_ONLY ? `${name}=...` : cookie;
  });
}

function rewriteLocationHeader(locationValue) {
  if (!locationValue || !REWRITE_REDIRECT_LOCATION_HEADERS) {
    return locationValue;
  }

  let newValue = locationValue;

  if (newValue.startsWith(NEXT_DEV_ORIGIN)) {
    newValue = newValue.replace(NEXT_DEV_ORIGIN, LOCAL_PUBLIC_ORIGIN);
  }

  if (newValue.startsWith(REMOTE_APP_ORIGIN)) {
    newValue = newValue.replace(REMOTE_APP_ORIGIN, LOCAL_PUBLIC_ORIGIN);
  }

  return newValue;
}

function rewriteSingleSetCookie(cookie) {
  let out = String(cookie);

  if (REWRITE_SET_COOKIE_DOMAIN_MODE === "strip") {
    out = out.replace(/;\s*Domain=[^;]+/i, "");
  } else if (REWRITE_SET_COOKIE_DOMAIN_MODE === "replace") {
    if (/;\s*Domain=/i.test(out)) {
      out = out.replace(
        /;\s*Domain=[^;]+/i,
        `; Domain=${SET_COOKIE_DOMAIN_REPLACEMENT}`
      );
    }
  }

  if (STRIP_SECURE_COOKIE_FLAG) {
    out = out.replace(/;\s*Secure/gi, "");
  }

  if (REWRITE_SAMESITE_NONE_TO_LAX) {
    out = out.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }

  return out;
}

function rewriteSetCookieHeaders(setCookieHeader) {
  if (!setCookieHeader) return setCookieHeader;

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  return cookies.map(rewriteSingleSetCookie);
}

function removeCorsHeaders(headers) {
  if (!REMOVE_CORS_RESPONSE_HEADERS) return;

  delete headers["access-control-allow-origin"];
  delete headers["access-control-allow-credentials"];
  delete headers["access-control-allow-methods"];
  delete headers["access-control-allow-headers"];
  delete headers["access-control-expose-headers"];
  delete headers["access-control-max-age"];
  delete headers["vary"];
}

function isApiRequest(url = "") {
  return url === API_PREFIX || url.startsWith(`${API_PREFIX}/`);
}

function describeTarget(url = "") {
  return isApiRequest(url) ? "API_REMOTE" : "NEXT_DEV";
}

function safeUrl(url) {
  return typeof url === "string" ? url : "/";
}

/* =========================
 * PROXIES
 * ========================= */

const uiProxy = httpProxy.createProxyServer({
  target: NEXT_DEV_TARGET,
  changeOrigin: false,
  ws: true,
  xfwd: ENABLE_X_FORWARDED_HEADERS,
  secure: false,
  proxyTimeout: PROXY_TIMEOUT_MS,
  timeout: REQUEST_TIMEOUT_MS,
});

const apiProxy = httpProxy.createProxyServer({
  target: REMOTE_APP_TARGET,
  changeOrigin: true,
  ws: true,
  xfwd: ENABLE_X_FORWARDED_HEADERS,
  secure: VERIFY_REMOTE_TLS,
  proxyTimeout: PROXY_TIMEOUT_MS,
  timeout: REQUEST_TIMEOUT_MS,
});

/* =========================
 * EVENTOS - UI PROXY
 * ========================= */

uiProxy.on("proxyReq", (proxyReq, req) => {
  const url = safeUrl(req.url);

  log("UI->REQ", `${req.method} ${url} -> ${NEXT_DEV_TARGET}`);

  if (LOG_HEADERS) {
    log("UI->REQ-HDR", `${req.method} ${url}`, sanitizeHeaders(req.headers));
  }
});

uiProxy.on("proxyRes", (proxyRes, req) => {
  const url = safeUrl(req.url);

  if (proxyRes.headers.location) {
    const oldLocation = proxyRes.headers.location;
    const newLocation = rewriteLocationHeader(oldLocation);

    if (oldLocation !== newLocation) {
      proxyRes.headers.location = newLocation;
      log("UI<-RES", `Reescrevendo Location`, {
        method: req.method,
        url,
        from: oldLocation,
        to: newLocation,
      });
    }
  }

  log(
    "UI<-RES",
    `${req.method} ${url} <- ${proxyRes.statusCode} ${proxyRes.statusMessage || ""}`.trim()
  );

  if (LOG_HEADERS) {
    log("UI<-RES-HDR", `${req.method} ${url}`, sanitizeHeaders(proxyRes.headers));
  }
});

uiProxy.on("error", (err, req, res) => {
  const url = safeUrl(req?.url);

  log("UI-ERR", `${req?.method || "UNKNOWN"} ${url} -> ${err.message}`);

  if (res && !res.headersSent) {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
  }

  if (res && !res.writableEnded) {
    res.end(
      JSON.stringify(
        {
          ok: false,
          proxy: "ui",
          message: "Falha ao encaminhar requisição para o Next.js dev server.",
          error: err.message,
          target: NEXT_DEV_TARGET,
          url,
        },
        null,
        2
      )
    );
  }
});

/* =========================
 * EVENTOS - API PROXY
 * ========================= */

apiProxy.on("proxyReq", (proxyReq, req) => {
  const url = safeUrl(req.url);

  if (REWRITE_API_REQUEST_HOST) {
    proxyReq.setHeader("host", new URL(REMOTE_APP_TARGET).host);
  }

  if (REWRITE_API_REQUEST_ORIGIN && req.headers.origin) {
    proxyReq.setHeader("origin", REMOTE_APP_ORIGIN);
  }

  if (REWRITE_API_REQUEST_REFERER && req.headers.referer) {
    proxyReq.setHeader("referer", REMOTE_APP_ORIGIN);
  }

  log("API->REQ", `${req.method} ${url} -> ${REMOTE_APP_TARGET}`);

  if (LOG_HEADERS) {
    log("API->REQ-HDR", `${req.method} ${url}`, {
      inbound: sanitizeHeaders(req.headers),
      outboundCritical: {
        host: proxyReq.getHeader("host"),
        origin: proxyReq.getHeader("origin"),
        referer: proxyReq.getHeader("referer"),
      },
    });
  }
});

apiProxy.on("proxyRes", (proxyRes, req) => {
  const url = safeUrl(req.url);

  if (proxyRes.headers["set-cookie"]) {
    const before = summarizeSetCookies(proxyRes.headers["set-cookie"]);
    const rewritten = rewriteSetCookieHeaders(proxyRes.headers["set-cookie"]);
    proxyRes.headers["set-cookie"] = rewritten;
    const after = summarizeSetCookies(rewritten);

    log("API<-COOKIE", `${req.method} ${url}`, {
      before,
      after,
    });
  }

  if (proxyRes.headers.location) {
    const oldLocation = proxyRes.headers.location;
    const newLocation = rewriteLocationHeader(oldLocation);

    if (oldLocation !== newLocation) {
      proxyRes.headers.location = newLocation;
      log("API<-RES", `Reescrevendo Location`, {
        method: req.method,
        url,
        from: oldLocation,
        to: newLocation,
      });
    }
  }

  removeCorsHeaders(proxyRes.headers);

  log(
    "API<-RES",
    `${req.method} ${url} <- ${proxyRes.statusCode} ${proxyRes.statusMessage || ""}`.trim()
  );

  if (LOG_HEADERS) {
    log("API<-RES-HDR", `${req.method} ${url}`, sanitizeHeaders(proxyRes.headers));
  }
});

apiProxy.on("error", (err, req, res) => {
  const url = safeUrl(req?.url);

  log("API-ERR", `${req?.method || "UNKNOWN"} ${url} -> ${err.message}`);

  if (res && !res.headersSent) {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
  }

  if (res && !res.writableEnded) {
    res.end(
      JSON.stringify(
        {
          ok: false,
          proxy: "api",
          message: "Falha ao encaminhar requisição para a API remota.",
          error: err.message,
          target: REMOTE_APP_TARGET,
          url,
        },
        null,
        2
      )
    );
  }
});

/* =========================
 * SERVIDOR HTTP
 * ========================= */

const server = http.createServer((req, res) => {
  const url = safeUrl(req.url);

  if (url === "/__dev-proxy/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify(
        {
          ok: true,
          localOrigin: LOCAL_PUBLIC_ORIGIN,
          nextDevTarget: NEXT_DEV_TARGET,
          remoteAppTarget: REMOTE_APP_TARGET,
          apiPrefix: API_PREFIX,
          now: new Date().toISOString(),
        },
        null,
        2
      )
    );
    return;
  }

  log("REQ", `${req.method} ${url} [${describeTarget(url)}]`);

  if (isApiRequest(url)) {
    apiProxy.web(req, res);
    return;
  }

  uiProxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  const url = safeUrl(req.url);

  if (LOG_WEBSOCKET_UPGRADES) {
    log("WS", `Upgrade ${url} [${describeTarget(url)}]`);
  }

  if (isApiRequest(url)) {
    apiProxy.ws(req, socket, head);
    return;
  }

  uiProxy.ws(req, socket, head);
});

server.on("clientError", (err, socket) => {
  log("CLIENT-ERR", err.message);

  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

server.listen(LOCAL_PORT, LOCAL_BIND_HOST, () => {
  warnIfUnsafeBind();

  log("BOOT", "Proxy local iniciado com sucesso.");
  log("BOOT", `Abra no navegador: ${LOCAL_PUBLIC_ORIGIN}`);
  log("BOOT", `UI local      -> ${NEXT_DEV_TARGET}`);
  log("BOOT", `API remota    -> ${REMOTE_APP_TARGET}`);
  log("BOOT", `Prefixo API   -> ${API_PREFIX}`);
  log("BOOT", `Healthcheck   -> ${LOCAL_PUBLIC_ORIGIN}/__dev-proxy/health`);
  log(
    "BOOT",
    "Lembrete: para funcionar sem CORS, abra o app no proxy local, não no :3000 direto."
  );
});