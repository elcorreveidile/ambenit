"use client";

import { useState } from "react";
import { site } from "@/lib/site-config";

/** Una docena de guiños (frases graciosas aleatorias). Edítalas a gusto. */
const FRASES = [
  "Sonríe, que el saldo sigue a 270 €.",
  "Sin flash no hay paraíso.",
  "277 disparos y ni un «gracias, tito».",
  "La próxima vez, presupuesto ANTES del clic.",
  "Enfoca al sobrino, dispara a la factura.",
  "Cada fogonazo, un duro menos.",
  "Si sale movida, es arte.",
  "Hecho de noche, cobrado de día.",
  "Píxeles gratis, cariño aparte.",
  "El tito revela; el sobrino, factura.",
  "Esto no lo cubre el flash.",
  "Guiño, fogonazo, y a otra cosa.",
];

let audioCtx: AudioContext | null = null;

/** Sintetiza un sonido de cámara: clic de obturador + "pi" del flash. */
function sonidoFlash() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const ctx = audioCtx;
    const t = ctx.currentTime;

    // Clic del obturador: ráfaga corta de ruido filtrado.
    const dur = 0.05;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const ng = ctx.createGain();
    ng.gain.value = 0.28;
    noise.connect(hp).connect(ng).connect(ctx.destination);
    noise.start(t);

    // "Pi" del flash: tono corto ascendente.
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.08);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.12, t + 0.012);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(og).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  } catch {
    // Sin audio disponible: seguimos con el flash visual sin romper nada.
  }
}

export default function Firma() {
  const [disparo, setDisparo] = useState(0); // se incrementa para relanzar el flash
  const [frase, setFrase] = useState<string | null>(null);

  function disparar() {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);
    setDisparo((d) => d + 1);
    sonidoFlash();
  }

  return (
    <div className="firma">
      <p className="credit">
        Desarrollo por{" "}
        <a href={site.desarrollo.url} target="_blank" rel="noopener noreferrer">
          {site.desarrollo.por}
        </a>
        <button
          type="button"
          className="flashbtn"
          onMouseEnter={disparar}
          onClick={disparar}
          aria-label="Disparar el flash"
          title="Pásame el ratón…"
        >
          📸
        </button>
      </p>
      {frase && (
        <p className="firma-frase" key={disparo}>
          {frase}
        </p>
      )}
      {disparo > 0 && <span className="flash" key={"f" + disparo} aria-hidden="true" />}
    </div>
  );
}
