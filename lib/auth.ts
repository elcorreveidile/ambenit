import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";

/** "ambenit <no-reply@ambenit.com>" → { name, email } para la API de Brevo. */
function parseSender(from?: string): { name?: string; email: string } {
  if (!from) return { name: "ambenit", email: "no-reply@ambenit.com" };
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1] || undefined, email: m[2] };
  return { email: from.trim() };
}

/**
 * Auth.js con magic link por email y allowlist: solo ADMIN_EMAIL entra a /admin.
 * El email se envía por la **API de Brevo** (no SMTP), con BREVO_API_KEY.
 *
 * Variables necesarias (ver .env.example):
 *   DATABASE_URL, BREVO_API_KEY, EMAIL_FROM, ADMIN_EMAIL, AUTH_SECRET
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    adapter: NeonAdapter(pool),
    providers: [
      Nodemailer({
        from: process.env.EMAIL_FROM,
        // El transporte SMTP no se usa (enviamos por API), pero el proveedor lo pide.
        server: { host: "smtp-relay.brevo.com", port: 587, auth: { user: "apikey", pass: "unused" } },
        async sendVerificationRequest({ identifier, url }) {
          const key = process.env.BREVO_API_KEY;
          if (!key) throw new Error("Falta BREVO_API_KEY");
          const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": key,
              "content-type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              sender: parseSender(process.env.EMAIL_FROM),
              to: [{ email: identifier }],
              subject: "Tu acceso a ambenit",
              htmlContent: `<div style="font-family:system-ui,sans-serif;color:#1a1a1a">
                <h2 style="font-family:Georgia,serif">Entrar en ambenit</h2>
                <p>Pulsa para acceder al panel de fotos:</p>
                <p><a href="${url}" style="display:inline-block;background:#d8a24a;color:#231704;padding:12px 22px;border-radius:100px;text-decoration:none;font-weight:600">Entrar en el panel</a></p>
                <p style="color:#888;font-size:12px">Si no has sido tú, ignora este correo.</p>
              </div>`,
              textContent: `Entra en el panel de ambenit: ${url}`,
            }),
          });
          if (!res.ok) {
            throw new Error(`Brevo API ${res.status}: ${await res.text()}`);
          }
        },
      }),
    ],
    pages: {
      // Sin verifyRequest/error personalizados: el flujo lo controla la server
      // action de /admin con redirect manual (evita el POST a verify-request).
      signIn: "/admin",
    },
    callbacks: {
      // Allowlist: solo Antonio (ADMIN_EMAIL) puede iniciar sesión.
      async signIn({ user }) {
        const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const email = user?.email?.toLowerCase().trim();
        return Boolean(admin && email && email === admin);
      },
    },
  };
});

/** ¿El visitante actual es el admin autenticado? */
export async function isAdmin(): Promise<boolean> {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!admin) return false;
  const session = await auth();
  return session?.user?.email?.toLowerCase().trim() === admin;
}
