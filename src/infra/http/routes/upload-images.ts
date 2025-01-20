import { uploadImage } from "@/app/use-cases/upload-image";
import { isRight, unwrapEither } from "@/shared/either";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/uploads",
    {
      schema: {
        summary: "Upload an image",
        consumes: ["multipart/form-data"],
        response: {
          201: z.null().describe("Image uploaded"),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      // Acesso ao arquivo enviado
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, // 2mb
        },
      });

      if (!uploadedFile) {
        return reply.status(400).send({ message: "File is required" });
      }

      const result = await uploadImage({
        fileName: uploadedFile?.filename,
        contentType: uploadedFile?.mimetype,
        contentStream: uploadedFile?.file,
      });

      if (isRight(result)) {
        return reply.status(201).send();
      }

      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case "InvalidFileFormat":
          return reply.status(400).send({ message: error.message });
      }
    }
  );
};
