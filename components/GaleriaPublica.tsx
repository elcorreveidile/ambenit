import { site } from "@/lib/site-config";
import { listPhotos } from "@/lib/db";
import Galeria, { type Foto } from "./Galeria";

/**
 * Galería pública. Lee las fotos de Neon; si no hay ninguna (o no hay base de
 * datos configurada todavía) muestra las fotos semilla de /public.
 */
export default async function GaleriaPublica() {
  const dbPhotos = await listPhotos();
  const usandoSemilla = dbPhotos.length === 0;

  const fotos: Foto[] = usandoSemilla
    ? site.galeria.semilla.map((f) => ({ id: f.src, src: f.src, alt: f.alt }))
    : dbPhotos.map((p) => ({
        id: p.id,
        src: p.blob_url,
        alt: p.alt ?? "Recital nocturno — ambenit",
      }));

  return (
    <div className="wrap">
      <div className="eyebrow">La galería</div>
      <h2>
        La selección, <em>disparo a disparo</em>
      </h2>
      <p className="sub">
        Fotos reales del recital, revisadas y elegidas a mano. El contador avanza
        hasta las {site.galeria.objetivo} del pack.
      </p>

      <Galeria
        photos={fotos}
        objetivo={site.galeria.objetivo}
        usandoSemilla={usandoSemilla}
      />
    </div>
  );
}
