import { env } from "@/env";
import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { uploadImageRoute } from "./routes/upload-images";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// configuracao de error genéricos
server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.validation,
    });
  }

  return reply.status(500).send({ message: "Internal server error" });
});

server.register(fastifyCors, { origin: "*" });

//Rotas
server.register(uploadImageRoute);

server
  .listen({
    port: 3000,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("HTTP server is running...");
  });
