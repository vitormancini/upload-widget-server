import { db } from "@/infra/db";
import { schemas } from "@/infra/db/schemas";
import { fakerPT_BR as faker } from "@faker-js/faker";
// biome-ignore lint/style/useImportType: <explanation>
import { InferInsertModel } from "drizzle-orm";

// O usuário pode ou não enviar dados para fabricar uploads
export async function makeUpload(overrides?: Partial<InferInsertModel<typeof schemas.uploads>>) {
  const fileName = faker.system.fileName();

  const result = await db
    .insert(schemas.uploads)
    .values({
      name: fileName,
      remoteKey: `images/${fileName}`,
      remoteUrl: faker.internet.url(),
      ...overrides,
    })
    .returning();

  return result[0];
}
