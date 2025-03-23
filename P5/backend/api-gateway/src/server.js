require("dotenv").config();
const fastify = require("fastify")({ logger: true });

const SERVICES = {
  equipos: process.env.MS_EQUIPOS,
  ubicaciones: process.env.MS_UBICACIONES,
  mantenimiento: process.env.MS_MANTENIMIENTO,
  reportes: process.env.MS_REPORTES
};

["equipos", "ubicaciones"].forEach(service => {
  fastify.register(require("@fastify/http-proxy"), {
    upstream: SERVICES[service],
    prefix: `/${service}`,
    rewritePrefix: "",
  });
});

["mantenimiento", "reportes"].forEach(service => {
  fastify.register(require("@fastify/http-proxy"), {
    upstream: SERVICES[service],
    prefix: `/${service}`,
    rewritePrefix: "",
  });
});

fastify.get("/", async (req, reply) => {
  return { mensaje: "API Gateway con Fastify funcionando correctamente" };
});

fastify.listen({ port: 8080, host: "::" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`API Gateway corriendo en ${address}`);
});
