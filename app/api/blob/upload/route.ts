import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Autoriza subidas DIRECTAS del navegador a Vercel Blob (client uploads).
 * Ventajas: el archivo va tal cual (sin recomprimir → calidad original) y se
 * salta el límite de 4,5 MB de los cuerpos de función serverless.
 * El registro en Neon lo hace el cliente al terminar (funciona en local y prod).
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await isAdmin())) throw new Error("No autorizado");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/tiff",
            "image/heic",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB por foto
        };
      },
      onUploadCompleted: async () => {
        // No-op: el registro en Neon lo hace el cliente tras subir.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
