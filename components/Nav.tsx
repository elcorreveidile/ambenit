"use client";

import { useState } from "react";
import { site } from "@/lib/site-config";

const LINKS: [string, string][] = [
  ["#fotografo", "El fotógrafo"],
  ["#galeria", "Galería"],
  ["#marco", "Marco"],
  ["#cuenta", "La cuenta"],
  ["#contacto", "Contacto"],
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav>
      <div className="wrap">
        <div className="brand">
          {site.marca}
          <small>{site.tagline}</small>
        </div>
        <div className="navlinks">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <button
          type="button"
          className="hamburger"
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`mobile-menu${open ? " open" : ""}`}>
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
