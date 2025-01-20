import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schemas } from "@/infra/db/schemas";
import { uploadFileToStorage } from "@/infra/storage/upload-file-to-storage";
// biome-ignore lint/style/useImportType: <explanation>
import { Either, makeLeft, makeRight } from "@/shared/either";
import { z } from "zod";
import { InvalidFileFormat } from "../errors/invalid-file-format";

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.input<typeof uploadImageInput>;

const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

export async function uploadImage(
  input: UploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
  const { fileName, contentType, contentStream } = uploadImageInput.parse(input);

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormat());
  }

  // Carregar a imagem para o Cloudfare R2
  const { key, url } = await uploadFileToStorage({
    fileName,
    contentType,
    contentStream,
    folder: "images",
  });

  // Inserção da imagem no banco de dados
  await db.insert(schemas.uploads).values({
    name: fileName,
    remoteKey: key,
    remoteUrl: url,
  });

  return makeRight({ url });
}
