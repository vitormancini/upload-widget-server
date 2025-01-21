import { fastifyCors } from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { exportUploadsRoute } from "./routes/export-uploads";
import { getUploadsRoute } from "./routes/get-uploads";
import { uploadImageRoute } from "./routes/upload-images";
import { transformSwaggerSchema } from "./transform-swagger-schema";

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

// Cors
server.register(fastifyCors, { origin: "*" });

// Documentação Swagger
server.register(fastifyMultipart);
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Upload Server",
      version: "1.0.0",
    },
  },
  transform: transformSwaggerSchema,
});
server.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

//Rotas
server.register(uploadImageRoute);
server.register(getUploadsRoute);
server.register(exportUploadsRoute);

server
  .listen({
    port: 3000,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("HTTP server is running...");
  });
