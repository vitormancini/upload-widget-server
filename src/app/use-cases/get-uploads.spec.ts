import { db } from "@/infra/db";
import { schemas } from "@/infra/db/schemas";
import { isRight, unwrapEither } from "@/shared/either";
import { makeUpload } from "@/test/factories/make-upload";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUploads } from "./get-uploads";

describe("Get uploads", () => {
  // Exclui os dados do banco de teste antes de realizar os testes
  beforeEach(async () => {
    await db.delete(schemas.uploads);
  });

  it("should be able to get uploads", async () => {
    const upload1 = await makeUpload();
    const upload2 = await makeUpload();
    const upload3 = await makeUpload();
    const upload4 = await makeUpload();
    const upload5 = await makeUpload();

    const sut = await getUploads({ sortDirection: "asc" });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });

  it("should be able to get paginated uploads", async () => {
    const upload1 = await makeUpload();
    const upload2 = await makeUpload();
    const upload3 = await makeUpload();
    const upload4 = await makeUpload();
    const upload5 = await makeUpload();

    // biome-ignore lint/style/useConst: <explanation>
    let sut = await getUploads({ page: 1, pageSize: 3, sortDirection: "asc" });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
    ]);

    sut = await getUploads({ page: 2, pageSize: 3, sortDirection: "asc" });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toEqual(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });
});
