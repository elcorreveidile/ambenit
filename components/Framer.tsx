"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Estilos de marco disponibles. */
const ESTILOS = {
  blanco: { label: "Passe-partout blanco", color: "#f7f5ef", line: "#d8d2c4", polaroid: false },
  crema: { label: "Passe-partout crema", color: "#efe6d3", line: "#d3c39d", polaroid: false },
  negro: { label: "Passe-partout negro", color: "#0c0b10", line: "#2a2733", polaroid: false },
  fino: { label: "Borde fino negro", color: "#0c0b10", line: "", polaroid: false },
  polaroid: { label: "Polaroid", color: "#ffffff", line: "", polaroid: true },
  sin: { label: "Sin marco", color: "#000000", line: "", polaroid: false },
} as const;
type EstiloKey = keyof typeof ESTILOS;

/** Grosor del passe-partout como fracción del lado corto. */
const GROSOR = { fino: 0.04, medio: 0.08, amplio: 0.14 } as const;
type GrosorKey = keyof typeof GROSOR;

/** Formato de salida (añade fondo del mismo color para llegar a la proporción). */
const FORMATO = {
  orig: { label: "Original", r: 0 },
  cuadrado: { label: "Cuadrado 1:1", r: 1 },
  vertical: { label: "Vertical 4:5", r: 4 / 5 },
  horizontal: { label: "Apaisado 3:2", r: 3 / 2 },
} as const;
type FormatoKey = keyof typeof FORMATO;

export default function Framer({
  src,
  name = "foto",
}: {
  src: string | null;
  name?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [estilo, setEstilo] = useState<EstiloKey>("blanco");
  const [grosor, setGrosor] = useState<GrosorKey>("medio");
  const [formato, setFormato] = useState<FormatoKey>("orig");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bmp) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const iw = bmp.width;
    const ih = bmp.height;
    const short = Math.min(iw, ih);
    const st = ESTILOS[estilo];
    const pad = st.polaroid || estilo !== "sin" ? Math.round(short * GROSOR[grosor]) : 0;
    const bottomExtra = st.polaroid ? Math.round(short * 0.16) : 0;

    // Caja "contenido" = imagen + márgenes.
    const contentW = iw + pad * 2;
    const contentH = ih + pad * 2 + bottomExtra;

    // Aplicar formato de salida ampliando el lienzo (más fondo del mismo color).
    let W = contentW;
    let H = contentH;
    const r = FORMATO[formato].r;
    if (r > 0) {
      const cur = W / H;
      if (cur < r) W = Math.round(H * r);
      else H = Math.round(W / r);
    }

    canvas.width = W;
    canvas.height = H;

    // Fondo (marco).
    ctx.fillStyle = st.color;
    ctx.fillRect(0, 0, W, H);

    const offX = Math.round((W - contentW) / 2);
    const offY = Math.round((H - contentH) / 2);
    const imgX = offX + pad;
    const imgY = offY + pad;

    // Línea interior fina (si el estilo la lleva).
    if (st.line) {
      const g = Math.max(1, Math.round(short * 0.006));
      ctx.strokeStyle = st.line;
      ctx.lineWidth = g;
      ctx.strokeRect(imgX - g, imgY - g, iw + g * 2, ih + g * 2);
    }

    ctx.drawImage(bmp, imgX, imgY, iw, ih);
  }, [bmp, estilo, grosor, formato]);

  // Cargar la imagen (fetch → bitmap) SOLO cuando cambia src.
  useEffect(() => {
    let cancel = false;
    (async () => {
      setBmp(null);
      setError(null);
      if (!src) return;
      setLoading(true);
      try {
        const res = await fetch(src, { mode: "cors" });
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        if (cancel) return;
        setBmp(bitmap);
      } catch {
        if (cancel) return;
        setError("No se pudo cargar la imagen para enmarcar.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [src]);

  // Redibujar cuando hay bitmap o cambian las opciones.
  useEffect(() => {
    if (bmp) draw();
  }, [bmp, draw]);

  function descargar() {
    const canvas = canvasRef.current;
    if (!canvas || !bmp) return;
    canvas.toBlob(
      (b) => {
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\.[^.]+$/, "")}-marco-${estilo}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.95,
    );
  }

  return (
    <div className="framer">
      <div className="framer-controls">
        <label>
          Estilo
          <select value={estilo} onChange={(e) => setEstilo(e.target.value as EstiloKey)}>
            {Object.entries(ESTILOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Grosor
          <select
            value={grosor}
            onChange={(e) => setGrosor(e.target.value as GrosorKey)}
            disabled={estilo === "sin"}
          >
            {Object.keys(GROSOR).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          Formato
          <select value={formato} onChange={(e) => setFormato(e.target.value as FormatoKey)}>
            {Object.entries(FORMATO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-gold" onClick={descargar} disabled={!src || loading}>
          ↓ Descargar enmarcada
        </button>
      </div>

      <div className="framer-preview">
        {!src && <p className="empty-note">Elige una foto de la galería o sube la tuya.</p>}
        {loading && <p className="busy">Cargando imagen…</p>}
        {error && <p className="note">{error}</p>}
        <canvas ref={canvasRef} style={{ display: src && !error ? "block" : "none" }} />
      </div>
      <p className="note">
        El original no se toca: esto genera una copia enmarcada para entregar.
      </p>
    </div>
  );
}
