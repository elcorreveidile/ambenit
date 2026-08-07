-- Esquema de la base de datos "ambenit" (Neon / Postgres).
-- Ejecutar una vez en la consola SQL de Neon (o con `psql "$DATABASE_URL" -f sql/schema.sql`).

-- ── Galería ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id          TEXT PRIMARY KEY,
  blob_url    TEXT NOT NULL,
  alt         TEXT,
  sort_order  DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS photos_sort_idx ON photos (sort_order, created_at);

-- ── Auth.js (adaptador @auth/neon-adapter) ──────────────────────────────────
-- Tablas estándar de Auth.js. Necesarias para el login por email (magic link).
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  SERIAL,
  "userId"            INTEGER NOT NULL,
  type                VARCHAR(255) NOT NULL,
  provider            VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  id_token            TEXT,
  scope               TEXT,
  session_state       TEXT,
  token_type          TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id             SERIAL,
  "userId"       INTEGER NOT NULL,
  expires        TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL,
  name            VARCHAR(255),
  email           VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image           TEXT,
  PRIMARY KEY (id)
);
