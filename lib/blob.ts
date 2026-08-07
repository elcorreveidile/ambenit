import { put, del } from "@vercel/blob";

/** Sube un archivo a Vercel Blob (acceso público) y devuelve su URL. */
export async function uploadToBlob(
  filename: string,
  data: Buffer | ArrayBuffer | Blob,
  contentType?: string,
): Promise<string> {
  const { url } = await put(`galeria/${filename}`, data, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });
  return url;
}

/** Borra un blob por su URL. */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}
