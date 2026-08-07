# ambenit — fotografía nocturna

Landing del estudio de fotografía de **Antonio Maldonado Benítez** (recitales y
directos con luz natural nocturna). Es una web de verdad —con galería real y panel
de subida— envuelta en la broma familiar del **trueque tito ↔ sobrino** ("tus fotos
por mi web").

## Stack

- **Next.js** (App Router, TypeScript) + **React 19**
- **Neon** (Postgres serverless) — metadatos de la galería + tablas de Auth.js
- **Vercel Blob** — binarios de las fotos
- **Auth.js** (next-auth v5) con **magic link por email vía Brevo (SMTP)** — protege `/admin`
- Diseño en `app/globals.css`; fuentes (Fraunces / Inter / Caveat) con `next/font`

### Dos cosas clave

- **Calidad original.** Las fotos se suben **directas del navegador a Vercel Blob**
  (`@vercel/blob/client`), sin recomprimir ni redimensionar — se guardan tal cual,
  como en Drive. Esto además evita el límite de 4,5 MB de las funciones serverless.
  Cada foto tiene enlace "↓ original" para verificar los bytes exactos.
- **Marco.** Herramienta pública (`#marco`) para poner passe-partout / borde / polaroid
  a cualquier foto, elegir grosor y formato, y descargar una copia enmarcada. El
  original nunca se toca. La galería tiene además un toggle "ver con marco".

## Estructura

```
app/
  page.tsx                     landing completa (secciones desde lib/site-config.ts)
  admin/page.tsx               login por email + gestor de fotos
  api/photos/route.ts          subir (POST) / borrar (DELETE) fotos — solo admin
  api/auth/[...nextauth]/      handlers de Auth.js
components/
  GaleriaPublica.tsx           galería pública (lee Neon; cae a semilla /public)
  Uploader.tsx                 subida + gestión de fotos (cliente)
lib/
  site-config.ts               TODOS los textos/datos editables (placeholders marcados)
  db.ts · blob.ts · auth.ts    Neon · Vercel Blob · Auth.js
sql/schema.sql                 tablas (photos + Auth.js)
public/                        antonio.webp (retrato) + sesion-1..5.jpg (semilla)
```

> **Datos editables:** todo lo textual vive en `lib/site-config.ts`. El email y el
> Instagram son **placeholders** (`// TODO`); el nombre/edad y las cifras del trueque
> están marcados para confirmar.

## Puesta en marcha (local)

```bash
# Trae las variables reales del proyecto en Vercel (Neon + Blob + resto):
vercel env pull .env.local
# Crea las tablas en Neon una sola vez:
npm run db:setup
# Arranca:
npm run dev
```

Si no usas Vercel CLI, copia `.env.example` a `.env.local` y rellena a mano.

Abre http://localhost:3000. **Sin base de datos configurada la web funciona igual**:
la galería muestra las fotos semilla de `public/`. El panel `/admin` necesita Neon +
Brevo para poder entrar.

### Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Cadena *pooled* de Neon |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob |
| `AUTH_SECRET` | Secreto de Auth.js (`npx auth secret`) |
| `BREVO_API_KEY` | API key de Brevo (`xkeysib-…`); el magic link se envía por su API |
| `EMAIL_FROM` | Remitente **verificado** en Brevo (dominio o email) |
| `ADMIN_EMAIL` | Único email autorizado a `/admin` (el de Antonio) |

### Base de datos

Crea el proyecto en Neon y aplica el esquema una vez (crea `photos` + tablas de Auth.js):

```bash
npm run db:setup
```

Alternativas: `psql "$DATABASE_URL" -f sql/schema.sql`, o pegar `sql/schema.sql` en la
consola SQL de Neon.

## Despliegue (Vercel)

1. Importa el repo en Vercel.
2. Añade el store **Neon** y el store **Blob** desde la pestaña *Storage* (Vercel
   inyecta `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN`).
3. Añade `AUTH_SECRET`, `BREVO_API_KEY`, `EMAIL_FROM` y `ADMIN_EMAIL` como variables.
4. Ejecuta `sql/schema.sql` contra la base de datos.
5. Deploy. El panel queda en `/admin`.

### Dominio

El dominio real es **ambenit.com** (ya comprado). En Vercel → *Settings → Domains*,
añade `ambenit.com` (y `www` si quieres) y apunta el DNS según indique Vercel. Auth.js
detecta el host automáticamente en Vercel; si hiciera falta, fija `AUTH_URL=https://ambenit.com`.
Para el email, verifica el remitente/dominio `ambenit.com` en Brevo (SPF/DKIM) y crea el
buzón o redirección de `hola@ambenit.com`.

## Cómo funciona la galería

- La web pública lee las fotos de Neon. Si no hay ninguna (o aún no hay DB), muestra
  las **fotos semilla** de `public/` para que nunca se vea vacía.
- Antonio entra en `/admin` con su email (magic link) y sube fotos: **en calidad
  original** (directo a Blob, sin recomprimir), **el lote entero de golpe** o un
  **.zip** con todas (se descomprime en el navegador), subiéndose **4 en paralelo**.
  Los metadatos van a Neon y aparecen al momento en la galería pública. Puede borrarlas
  desde el mismo panel, y cada foto tiene enlace "↓ original".
