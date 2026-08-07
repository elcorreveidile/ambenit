import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { deleteFromBlob } from "@/lib/blob";
import {
  insertPhoto,
  deletePhoto,
  getPhotoBlobUrl,
  isDbConfigured,
} from "@/lib/db";

export const runtime = "nodejs";

// Registrar en Neon una foto ya subida a Blob (solo admin).
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Falta DATABASE_URL / base de datos no configurada" },
      { status: 503 },
    );
  }

  const { blobUrl, alt } = await req
    .json()
    .catch(() => ({ blobUrl: null, alt: null }));
  if (!blobUrl || typeof blobUrl !== "string") {
    return NextResponse.json({ error: "Falta blobUrl" }, { status: 400 });
  }

  const row = await insertPhoto({
    id: randomUUID(),
    blobUrl,
    alt: alt ?? "Recital nocturno — ambenit",
    sortOrder: Date.now(),
  });
  return NextResponse.json({ ok: true, photo: row });
}

// Borrar una foto por id (solo admin): quita el blob y la fila de Neon.
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const url = await getPhotoBlobUrl(id);
  if (url) {
    try {
      await deleteFromBlob(url);
    } catch {
      // Si el blob ya no existe, seguimos borrando la fila igualmente.
    }
  }
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
