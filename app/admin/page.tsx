import Link from "next/link";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { isDbConfigured, listPhotos } from "@/lib/db";
import { site } from "@/lib/site-config";
import Uploader from "@/components/Uploader";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ check?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const admin = await isAdmin();

  // ── Autenticado: panel de gestión ──────────────────────────────────────
  if (admin) {
    const photos = await listPhotos();
    return (
      <section style={{ borderTop: "none" }}>
        <div className="wrap">
          <div className="admin-head">
            <div>
              <div className="eyebrow">Panel</div>
              <h2>Galería de {site.marca}</h2>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <button className="linkbtn" type="submit">
                Cerrar sesión
              </button>
            </form>
          </div>
          <p className="sub">
            Sube, revisa y quita fotos. Lo que publiques aquí se ve al instante en
            la galería pública.
          </p>
          <Uploader initial={photos} />
        </div>
      </section>
    );
  }

  // ── No autenticado: login por email ────────────────────────────────────
  const dbOk = isDbConfigured();
  return (
    <section style={{ borderTop: "none" }}>
      <div className="login-box">
        <h1>Panel de {site.marca}</h1>
        <p>Acceso solo para Antonio. Te mandamos un enlace de acceso al email.</p>

        {sp.check && (
          <p className="busy">
            Revisa tu correo: te hemos enviado el enlace de acceso. ✉
          </p>
        )}
        {sp.error && (
          <p className="note">No se pudo iniciar sesión. ¿El email es el correcto?</p>
        )}
        {!dbOk && (
          <p className="note">
            ⚠ Falta configurar la base de datos (DATABASE_URL) y el email para
            poder entrar.
          </p>
        )}

        <form
          action={async (formData: FormData) => {
            "use server";
            const email = String(formData.get("email") || "");
            await signIn("nodemailer", { email, redirectTo: "/admin" });
          }}
        >
          <input type="email" name="email" placeholder="tu@email.com" required />
          <button className="btn btn-gold" type="submit">
            Enviarme el enlace
          </button>
        </form>

        <p className="note">
          Volver a la <Link href="/">web</Link>.
        </p>
      </div>
    </section>
  );
}
