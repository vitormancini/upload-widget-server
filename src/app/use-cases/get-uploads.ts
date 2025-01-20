import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schemas } from "@/infra/db/schemas";
// biome-ignore lint/style/useImportType: <explanation>
import { Either, makeRight } from "@/shared/either";
import { asc, count, desc, ilike } from "drizzle-orm";
import { z } from "zod";

const getUploadsInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(["createdAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
});

type GetUploadsInput = z.input<typeof getUploadsInput>;

type GetUploadsOutput = {
  total: number;
  uploads: {
    id: string;
    name: string;
    remoteKey: string;
    remoteUrl: string;
    createdAt: Date;
  }[];
};

export async function getUploads(input: GetUploadsInput): Promise<Either<never, GetUploadsOutput>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } = getUploadsInput.parse(input);

  const [uploads, [{ total }]] = await Promise.all([
    db
      .select({
        id: schemas.uploads.id,
        name: schemas.uploads.name,
        remoteKey: schemas.uploads.remoteKey,
        remoteUrl: schemas.uploads.remoteUrl,
        createdAt: schemas.uploads.createdAt,
      })
      .from(schemas.uploads)
      .where(searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined)
      .orderBy((fields) => {
        if (sortBy && sortDirection === "asc") {
          return asc(fields[sortBy]);
        }

        if (sortBy && sortDirection === "desc") {
          return desc(fields[sortBy]);
        }

        return desc(fields.createdAt);
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schemas.uploads.id) })
      .from(schemas.uploads)
      .where(searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined),
  ]);

  return makeRight({ uploads, total });
}
