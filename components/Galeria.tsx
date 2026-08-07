"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import Framer from "./Framer";

export type Foto = { id: string; src: string; alt: string };

function nombreDe(src: string) {
  try {
    const last = src.split("?")[0].split("/").pop() || "foto";
    return decodeURIComponent(last);
  } catch {
    return "foto";
  }
}

/**
 * Descarga la foto con la firma «ambenit» incrustada (sin tocar el original
 * guardado: la marca se añade al vuelo aquí, en el navegador).
 */
async function descargarConMarca(src: string, nombre: string) {
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bmp.width;
    c.height = bmp.height;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bmp, 0, 0);

    const s = Math.max(16, Math.round(Math.min(c.width, c.height) * 0.035));
    const pad = Math.round(s * 0.8);
    ctx.font = `italic 600 ${s}px Georgia, "Times New Roman", serif`;
    ctx.textBaseline = "bottom";
    const text = "ambenit";
    const w = ctx.measureText(text).width;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = s * 0.3;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(233,197,131,0.92)";
    ctx.fillText(text, c.width - w - pad, c.height - pad);

    c.toBlob(
      (b) => {
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${nombre.replace(/\.[^.]+$/, "")}-ambenit.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.95,
    );
  } catch {
    window.open(src, "_blank");
  }
}

export default function Galeria({
  photos,
  objetivo,
  usandoSemilla,
}: {
  photos: Foto[];
  objetivo: number;
  usandoSemilla: boolean;
}) {
  const [conMarco, setConMarco] = useState(false);
  const [sel, setSel] = useState<string | null>(photos[0]?.src ?? null);
  const [selName, setSelName] = useState<string>(
    photos[0] ? nombreDe(photos[0].src) : "foto",
  );

  const n = photos.length;
  const pct = Math.min(100, (n / objetivo) * 100);

  function enmarcar(f: Foto) {
    setSel(f.src);
    setSelName(nombreDe(f.src));
    document.getElementById("marco")?.scrollIntoView({ behavior: "smooth" });
  }

  function subirPropia(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSel(URL.createObjectURL(f));
    setSelName(f.name);
    document.getElementById("marco")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <div className="meter">
        <span className="count">
          <b>{n}</b> / {objetivo} fotos
        </span>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="tools">
          <button
            className="chip"
            aria-pressed={conMarco}
            onClick={() => setConMarco((v) => !v)}
          >
            {conMarco ? "▣ con marco" : "▢ ver con marco"}
          </button>
        </div>
      </div>

      <div className={`grid${conMarco ? " conmarco" : ""}`}>
        {photos.map((f) => (
          <div className="tile" key={f.id}>
            <Image
              src={f.src}
              alt={f.alt}
              fill
              sizes="(max-width:720px) 33vw, 160px"
              style={{ objectFit: "cover" }}
            />
            <span className="wm" aria-hidden="true">ambenit</span>
            <div className="overlay">
              <button className="ob" onClick={() => enmarcar(f)}>
                ▣ Enmarcar
              </button>
              <button
                className="ob"
                onClick={() => descargarConMarca(f.src, nombreDe(f.src))}
                title="Descargar con la firma ambenit"
              >
                ↓ descargar
              </button>
            </div>
          </div>
        ))}
      </div>

      {n === 0 && (
        <p className="empty-note">
          Aún no hay fotos publicadas. En cuanto Antonio suba su selección, aparece aquí.
        </p>
      )}
      {usandoSemilla && n > 0 && (
        <p className="empty-note">
          Muestra de la sesión. La selección completa se publica desde el panel.
        </p>
      )}

      {/* ESTUDIO DE MARCO (público) */}
      <div id="marco" className="marco-studio">
        <div className="eyebrow" style={{ marginTop: 40 }}>
          El marco
        </div>
        <h2>
          Ponle <em>marco</em> a la foto
        </h2>
        <p className="sub">
          Elige una foto de arriba (botón «Enmarcar») o sube la tuya, prueba estilos
          y descárgala lista para enmarcar o entregar. El original nunca se toca.
        </p>

        <div className="marco-own">
          <label className="btn btn-ghost upload-btn">
            <span className="ico">↑</span> Subir mi foto
            <input
              type="file"
              accept="image/*"
              onChange={subirPropia}
              style={{ display: "none" }}
            />
          </label>
          <span className="upload-hint">o pulsa «Enmarcar» en una foto de arriba</span>
        </div>

        <Framer src={sel} name={selName} />
      </div>
    </>
  );
}
