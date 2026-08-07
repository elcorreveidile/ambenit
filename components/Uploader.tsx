"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { unzip } from "fflate";
import { site } from "@/lib/site-config";

export type AdminPhoto = {
  id: string;
  blob_url: string;
  alt: string | null;
};

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

/** Extrae las imágenes de un .zip en el navegador. */
function extraerZip(file: File): Promise<File[]> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      const u8 = new Uint8Array(r.result as ArrayBuffer);
      unzip(u8, (err, data) => {
        if (err) {
          resolve([]);
          return;
        }
        const out: File[] = [];
        for (const [name, bytes] of Object.entries(data)) {
          const lower = name.toLowerCase();
          if (lower.endsWith("/") || lower.includes("__macosx")) continue;
          const ext = lower.split(".").pop() || "";
          const type = TIPOS[ext];
          if (!type) continue;
          const base = name.split("/").pop() || name;
          out.push(new File([bytes as BlobPart], base, { type }));
        }
        resolve(out);
      });
    };
    r.onerror = () => resolve([]);
    r.readAsArrayBuffer(file);
  });
}

/** Ejecuta `worker` sobre `items` con como mucho `n` en paralelo. */
async function pool<T>(items: T[], n: number, worker: (item: T) => Promise<void>) {
  let i = 0;
  const runners = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

export default function Uploader({ initial }: { initial: AdminPhoto[] }) {
  const [photos, setPhotos] = useState<AdminPhoto[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const objetivo = site.galeria.objetivo;
  const n = photos.length;
  const pct = Math.min(100, (n / objetivo) * 100);

  /** Sube UN archivo en calidad original y lo registra en Neon. */
  async function subirUno(f: File) {
    const blob = await upload(f.name, f, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      contentType: f.type || undefined,
    });
    const resp = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blobUrl: blob.url, alt: null }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Error al registrar");
    }
    const { photo } = await resp.json();
    setPhotos((p) => [...p, { id: photo.id, blob_url: photo.blob_url, alt: photo.alt }]);
  }

  async function procesar(entrada: FileList | File[]) {
    setBusy(true);
    setMsg("Preparando…");

    // Separar imágenes sueltas y descomprimir ZIPs.
    const imagenes: File[] = [];
    for (const f of [...entrada]) {
      const esZip =
        f.name.toLowerCase().endsWith(".zip") ||
        f.type === "application/zip" ||
        f.type === "application/x-zip-compressed";
      if (esZip) {
        setMsg(`Descomprimiendo ${f.name}…`);
        imagenes.push(...(await extraerZip(f)));
      } else if (f.type.startsWith("image/")) {
        imagenes.push(f);
      }
    }

    if (!imagenes.length) {
      setBusy(false);
      setMsg("No encontré imágenes (ni en el ZIP).");
      return;
    }

    const total = imagenes.length;
    let done = 0;
    let error: string | null = null;
    setMsg(`Subiendo 0 / ${total}…`);

    // Subida en paralelo, 4 a la vez.
    await pool(imagenes, 4, async (f) => {
      try {
        await subirUno(f);
      } catch (e) {
        error = (e as Error).message;
      }
      done++;
      setMsg(`Subiendo ${done} / ${total}…`);
    });

    setBusy(false);
    setMsg(
      error
        ? `Terminado con alguna incidencia: ${error}`
        : `Listo: ${total} foto(s) subidas en calidad original ✓`,
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    if (!confirm("¿Quitar esta foto de la galería?")) return;
    const resp = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (resp.ok) setPhotos((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <label
        className={`drop${hot ? " hot" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setHot(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setHot(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setHot(false);
          if (e.dataTransfer?.files) procesar(e.dataTransfer.files);
        }}
      >
        <span className="ico">↑</span>
        <h3>Arrastra el lote entero, o un .zip</h3>
        <p>
          Se suben <b>en calidad original</b> (como Drive), <b>4 a la vez</b>. Vale
          seleccionar muchas fotos de golpe o un <b>.zip</b> con todas.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.zip,application/zip"
          multiple
          onChange={(e) => e.target.files && procesar(e.target.files)}
        />
      </label>

      <div className="meter">
        <span className="count">
          <b>{n}</b> / {objetivo} fotos
        </span>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>
      {busy && <p className="busy">{msg}</p>}
      {!busy && msg && <p className="note">{msg}</p>}

      <div className="grid">
        {photos.map((p) => (
          <div className="tile" key={p.id}>
            <Image
              src={p.blob_url}
              alt={p.alt ?? ""}
              fill
              sizes="(max-width:720px) 33vw, 160px"
              style={{ objectFit: "cover" }}
            />
            <a
              className="dl"
              href={p.blob_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Descargar/ver el original tal cual"
            >
              ↓ original
            </a>
            <button className="rm" aria-label="Quitar foto" onClick={() => remove(p.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
      {n === 0 && (
        <p className="empty-note">
          Galería vacía. Sube aquí la selección (o el .zip) y aparecerá en la web pública.
        </p>
      )}
    </>
  );
}
