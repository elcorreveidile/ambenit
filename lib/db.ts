import { neon } from "@neondatabase/serverless";

/** Foto guardada en la galería (metadatos; el binario vive en Vercel Blob). */
export type Photo = {
  id: string;
  blob_url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

/** ¿Hay base de datos configurada? Si no, el sitio usa la galería semilla. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

/** Lista las fotos publicadas, ordenadas. Vacío si no hay tabla o no hay DB. */
export async function listPhotos(): Promise<Photo[]> {
  if (!isDbConfigured()) return [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, blob_url, alt, sort_order, created_at
      FROM photos
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows as Photo[];
  } catch {
    // Tabla aún no creada u otro problema: no rompemos la web pública.
    return [];
  }
}

/** Inserta una foto (metadatos). Devuelve la fila creada. */
export async function insertPhoto(input: {
  id: string;
  blobUrl: string;
  alt?: string | null;
  sortOrder?: number;
}): Promise<Photo> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO photos (id, blob_url, alt, sort_order)
    VALUES (${input.id}, ${input.blobUrl}, ${input.alt ?? null}, ${input.sortOrder ?? 0})
    RETURNING id, blob_url, alt, sort_order, created_at
  `;
  return (rows as Photo[])[0];
}

/** Devuelve la URL del blob de una foto (para poder borrarlo también). */
export async function getPhotoBlobUrl(id: string): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`SELECT blob_url FROM photos WHERE id = ${id}`;
  const row = (rows as { blob_url: string }[])[0];
  return row?.blob_url ?? null;
}

/** Borra una foto por id. */
export async function deletePhoto(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM photos WHERE id = ${id}`;
}
