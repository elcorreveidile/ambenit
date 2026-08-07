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

export default function Firma() {
  const [disparo, setDisparo] = useState(0); // se incrementa para relanzar el flash
  const [frase, setFrase] = useState<string | null>(null);

  function disparar() {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);
    setDisparo((d) => d + 1);
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
