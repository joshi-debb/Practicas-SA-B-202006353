require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors(
  {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200
  }
));
app.use(express.json());

// Proxy para rutas REST de Equipos
app.use("/equipos", createProxyMiddleware({
  target: 'http://localhost:8081',
  changeOrigin: true,
  logLevel: "debug", // Esto ayudará a ver en consola lo que ocurre
  onError: (err, req, res) => {
    console.error("Error proxy /equipos:", err);
    res.status(500).send("Error proxy /equipos");
  }
}));

// Proxy para rutas REST de Ubicaciones
app.use("/ubicaciones", createProxyMiddleware({
  target: 'http://localhost:8082',
  changeOrigin: true,
  logLevel: "debug",
  onError: (err, req, res) => {
    console.error("Error proxy /ubicaciones:", err);
    res.status(500).send("Error proxy /ubicaciones");
  }
}));

// Proxy para GraphQL en Mantenimiento
app.use("/mantenimiento/graphql", createProxyMiddleware({
  target: 'http://localhost:8083',
  changeOrigin: true,
  pathRewrite: { "^/mantenimiento/graphql": "/graphql" },
  logLevel: "debug",
  onError: (err, req, res) => {
    console.error("Error proxy /mantenimiento/graphql:", err);
    res.status(500).json({ error: "Proxy error en mantenimiento", details: err.message });
  }
}));

// Proxy para GraphQL en Reportes
app.use("/reportes/graphql", createProxyMiddleware({
  target: 'http://localhost:8084',
  changeOrigin: true,
  pathRewrite: { "^/reportes/graphql": "/graphql" },
  logLevel: "debug",
  onError: (err, req, res) => {
    console.error("Error proxy /reportes/graphql:", err);
    res.status(500).json({ error: "Proxy error en reportes", details: err.message });
  }
}));

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API Gateway funcionando correctamente" });
});

app.listen(8080, "0.0.0.0", () => console.log(`API Gateway corriendo en puerto ${8080}`));
