import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace (evita el aviso por un package-lock.json en $HOME)
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      // Vercel Blob (fotos subidas desde /admin)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
