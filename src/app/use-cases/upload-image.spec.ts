import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schemas } from "@/infra/db/schemas";
import { isLeft, isRight, unwrapEither } from "@/shared/either";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { InvalidFileFormat } from "../errors/invalid-file-format";
import { uploadImage } from "./upload-image";

describe("Upload image", () => {
  beforeAll(() => {
    vi.mock("@/infra/storage/upload-file-to-storage", () => {
      return {
        uploadFileToStorage: vi.fn().mockImplementation(() => {
          return {
            key: `${randomUUID()}.jpg`,
            url: "https://storage.com/image.jpg",
          };
        }),
      };
    });
  });

  it("should be able to upload an image", async () => {
    const fileName = `${randomUUID()}.jpg`;

    const sut = await uploadImage({
      fileName,
      contentType: "image/jpg",
      contentStream: Readable.from([]),
    });

    expect(isRight(sut)).toBe(true);

    const result = await db
      .select()
      .from(schemas.uploads)
      .where(eq(schemas.uploads.name, fileName));

    expect(result).toHaveLength(1);
  });

  it("should not be able to upload an invalid file", async () => {
    const fileName = `${randomUUID()}.pdf`;

    const sut = await uploadImage({
      fileName,
      contentType: "document/pdf",
      contentStream: Readable.from([]),
    });

    expect(isLeft(sut)).toBe(true);
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat);
  });
});
