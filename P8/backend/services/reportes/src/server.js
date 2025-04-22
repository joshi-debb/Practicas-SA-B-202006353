require("dotenv").config();
const express = require("express");
const cors = require("cors");
const expressWinston = require("express-winston");
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");
const logger = require("./logger");
const { v4: uuidv4 } = require("uuid");

// Configuración de conexión a MySQL
const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT
});

const app = express();

// Middleware para generar request_id por petición
app.use((req, res, next) => {
  req.request_id = uuidv4();
  next();
});

// Logging de solicitudes HTTP (incluye request_id)
app.use(express.json());
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  dynamicMeta: (req, res) => ({ request_id: req.request_id })
}));

app.use(cors({
  origin: '*',
  methods: ['GET','POST'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Definición de esquema GraphQL para Reportes
const schema = buildSchema(`
  type Reporte {
    id: ID!
    tipo: String!
    descripcion: String!
    fecha: String
  }

  type Query {
    obtenerReportes: [Reporte]
    obtenerReportePorTipo(tipo: String!): [Reporte]
  }

  type Mutation {
    generarReporte(tipo: String!, descripcion: String!): Reporte
    eliminarReporte(id: ID!): String
  }
`);

// Resolvers con logging contextual
const root = {
  obtenerReportes: async (_args, context) => {
    context.logger.info("Resolver obtenerReportes");
    const [rows] = await db.query("SELECT * FROM reportes");
    return rows;
  },
  obtenerReportePorTipo: async ({ tipo }, context) => {
    context.logger.info(`Resolver obtenerReportePorTipo tipo=${tipo}`);
    const [rows] = await db.query(
      "SELECT * FROM reportes WHERE tipo = ?",
      [tipo]
    );
    return rows;
  },
  generarReporte: async ({ tipo, descripcion }, context) => {
    context.logger.info(`Resolver generarReporte tipo=${tipo}`, { tipo, descripcion });
    const [result] = await db.query(
      "INSERT INTO reportes (tipo, descripcion) VALUES (?, ?)",
      [tipo, descripcion]
    );
    const [nuevo] = await db.query(
      "SELECT * FROM reportes WHERE id = ?",
      [result.insertId]
    );
    return nuevo[0];
  },
  eliminarReporte: async ({ id }, context) => {
    context.logger.info(`Resolver eliminarReporte id=${id}`, { id });
    const [result] = await db.query(
      "DELETE FROM reportes WHERE id = ?",
      [id]
    );
    return result.affectedRows ? "Reporte eliminado" : "Reporte no encontrado";
  }
};

// Handler de GraphQL con contexto que incluye logger child
app.all('/reportes', createHandler({
  schema,
  rootValue: root,
  context: (req, res) => ({
    request_id: req.request_id,
    logger: logger.child({ request_id: req.request_id })
  })
}));

// Logging de errores GraphQL
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  dynamicMeta: (req, res, err) => ({ request_id: req.request_id })
}));

const PORT = process.env.PORT || 8084;
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Microservicio de Reportes iniciado', { request_id: '-', port: PORT });
});