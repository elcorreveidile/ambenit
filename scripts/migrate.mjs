// Aplica sql/schema.sql a la base de datos Neon.
// Uso:  npm run db:setup   (carga .env.local si existe)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "✗ Falta DATABASE_URL.\n  Trae las variables con:  vercel env pull .env.local\n  y vuelve a ejecutar:      npm run db:setup",
  );
  process.exit(1);
}

const sql = neon(url);
const raw = readFileSync(new URL("../sql/schema.sql", import.meta.url), "utf8");

// Quita comentarios de línea y separa por ';'
const statements = raw
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const st of statements) {
  await sql.query(st);
}

console.log(`✓ Esquema aplicado en Neon (${statements.length} sentencias).`);
