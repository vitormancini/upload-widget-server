"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = require("@fastify/cors");
var fastify_1 = require("fastify");
var server = (0, fastify_1.fastify)();
server.register(cors_1.fastifyCors, { origin: "*" });
server
    .listen({
    port: 3000,
    host: "0.0.0.0",
})
    .then(function () {
    console.log("HTTP server is running...");
});
