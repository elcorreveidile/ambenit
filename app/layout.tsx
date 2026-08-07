import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import { site } from "@/lib/site-config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "500", "600"],
  variable: "--font-fraunces",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
});

const titulo = "ambenit — fotografía nocturna · Antonio Maldonado Benítez";
const descripcion =
  "ambenit — fotografía de recitales y directos con luz natural nocturna. Selección y edición artística por Antonio Maldonado Benítez.";

export const metadata: Metadata = {
  metadataBase: new URL(site.dominio),
  title: titulo,
  description: descripcion,
  openGraph: {
    title: titulo,
    description: descripcion,
    url: site.dominio,
    siteName: "ambenit",
    locale: "es_ES",
    type: "website",
    images: ["/sesion-1.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
