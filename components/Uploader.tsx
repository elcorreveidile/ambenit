"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { site } from "@/lib/site-config";

export type AdminPhoto = {
  id: string;
  blob_url: string;
  alt: string | null;
};

export default function Uploader({ initial }: { initial: AdminPhoto[] }) {
  const [photos, setPhotos] = useState<AdminPhoto[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const objetivo = site.galeria.objetivo;
  const n = photos.length;
  const pct = Math.min(100, (n / objetivo) * 100);

  async function add(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    let done = 0;
    for (const f of list) {
      setMsg(`Subiendo ${done + 1} de ${list.length} — ${f.name} (original, sin recomprimir)…`);
      try {
        // Subida DIRECTA a Blob: el archivo va tal cual, sin tocar la calidad.
        const blob = await upload(f.name, f, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          contentType: f.type || undefined,
        });
        // Registrar metadatos en Neon.
        const resp = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blobUrl: blob.url, alt: null }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          setMsg(err.error || "Error al registrar la foto");
          setBusy(false);
          return;
        }
        const { photo } = await resp.json();
        setPhotos((p) => [
          ...p,
          { id: photo.id, blob_url: photo.blob_url, alt: photo.alt },
        ]);
      } catch (err) {
        setMsg((err as Error).message || "Error al subir la foto");
        setBusy(false);
        return;
      }
      done++;
    }
    setBusy(false);
    setMsg(`Listo: ${done} foto(s) subidas en calidad original ✓`);
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
          if (e.dataTransfer?.files) add(e.dataTransfer.files);
        }}
      >
        <span className="ico">↑</span>
        <h3>Arrastra las fotos o haz clic para elegir</h3>
        <p>
          Se suben <b>en calidad original</b>, sin recomprimir (como en Drive).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && add(e.target.files)}
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
            <button
              className="rm"
              aria-label="Quitar foto"
              onClick={() => remove(p.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {n === 0 && (
        <p className="empty-note">
          Galería vacía. Sube aquí la selección y aparecerá en la web pública.
        </p>
      )}
    </>
  );
}
