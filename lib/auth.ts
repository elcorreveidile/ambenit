import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";

/**
 * Auth.js con magic link por email (SMTP de Brevo) y allowlist:
 * solo el email de ADMIN_EMAIL puede entrar al panel /admin.
 *
 * Variables necesarias (ver .env.example):
 *   DATABASE_URL, EMAIL_SERVER, EMAIL_FROM, ADMIN_EMAIL, AUTH_SECRET
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    adapter: NeonAdapter(pool),
    providers: [
      Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    ],
    pages: {
      signIn: "/admin",
      verifyRequest: "/admin?check=1",
      error: "/admin?error=1",
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
