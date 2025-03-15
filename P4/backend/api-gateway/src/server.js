require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json());  // 🔹 Asegurar que el Gateway maneja JSON
app.use(express.urlencoded({ extended: true }));

// Definir servicios
const services = {
    equipos: process.env.EQUIPOS_SERVICE,
    ubicaciones: process.env.UBICACIONES_SERVICE,
    mantenimiento: process.env.MANTENIMIENTO_SERVICE,
    reportes: process.env.REPORTES_SERVICE
};

// Middleware REST para Equipos y Ubicaciones
Object.keys(services).forEach(service => {
    if (service !== "reportes" && service !== "mantenimiento") {
        app.use(`/${service}`, createProxyMiddleware({
            target: services[service],
            changeOrigin: true
        }));
    }
});

// Middleware especial para GraphQL en Reportes y Mantenimiento
app.use("/reportes/graphql", createProxyMiddleware({
    target: services.reportes,
    changeOrigin: true,
    pathRewrite: { "/reportes/graphql": "/graphql" },
    onProxyReq: (proxyReq, req) => {
        if (req.body) {
            let bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
}));

app.use("/mantenimiento/graphql", createProxyMiddleware({
    target: services.mantenimiento,
    changeOrigin: true,
    pathRewrite: { "/mantenimiento/graphql": "/graphql" },
    onProxyReq: (proxyReq, req) => {
        if (req.body) {
            let bodyData = JSON.stringify(req.body);
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
}));

app.get("/", (req, res) => {
    res.json({ mensaje: "API Gateway funcionando correctamente" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway corriendo en puerto ${PORT}`));
