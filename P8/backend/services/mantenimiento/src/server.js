require("dotenv").config();
const express = require("express");
const cors = require("cors");
const expressWinston = require("express-winston");
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");
const logger = require("./logger");
const { v4: uuidv4 } = require("uuid");

// Conexión a la base de datos
title: "Mantenimiento Logging Server"
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const app = express();

// Middleware: genera un request_id por petición
app.use((req, res, next) => {
  req.request_id = uuidv4();
  next();
});

// Logging de solicitudes HTTP, incluyendo request_id
app.use(express.json());
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  dynamicMeta: (req, res) => ({ request_id: req.request_id }),
}));

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));

// Esquema GraphQL
const schema = buildSchema(`
  type Mantenimiento {
    id: ID!
    equipo_id: Int!
    descripcion: String!
    estado: String!
    fecha: String
  }
  type Query {
    obtenerMantenimientos: [Mantenimiento]
  }
  type Mutation {
    agregarMantenimiento(equipo_id: Int!, descripcion: String!, estado: String!): Mantenimiento
    actualizarEstado(id: ID!, estado: String!): String
    eliminarMantenimiento(id: ID!): String
  }
`);

// Resolvers con logger contextualizado
const root = {
  obtenerMantenimientos: async (_args, context) => {
    context.logger.info("Resolver obtenerMantenimientos");
    const [rows] = await db.query("SELECT * FROM mantenimientos");
    return rows;
  },
  agregarMantenimiento: async ({ equipo_id, descripcion, estado }, context) => {
    context.logger.info("Resolver agregarMantenimiento", { equipo_id, descripcion, estado });
    const [result] = await db.query(
      "INSERT INTO mantenimientos (equipo_id, descripcion, estado) VALUES (?, ?, ?)",
      [equipo_id, descripcion, estado]
    );
    return { id: result.insertId, equipo_id, descripcion, estado };
  },
  actualizarEstado: async ({ id, estado }, context) => {
    context.logger.info("Resolver actualizarEstado", { id, estado });
    const [result] = await db.query(
      "UPDATE mantenimientos SET estado = ? WHERE id = ?",
      [estado, id]
    );
    return result.affectedRows ? "Estado actualizado con éxito" : "Mantenimiento no encontrado";
  },
  eliminarMantenimiento: async ({ id }, context) => {
    context.logger.info("Resolver eliminarMantenimiento", { id });
    const [result] = await db.query(
      "DELETE FROM mantenimientos WHERE id = ?",
      [id]
    );
    return result.affectedRows ? "Mantenimiento eliminado" : "Mantenimiento no encontrado";
  }
};

// Handler de GraphQL con contexto que incluye request_id
app.all('/mantenimiento', createHandler({
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
  dynamicMeta: (req, res, err) => ({ request_id: req.request_id }),
}));

const PORT = process.env.PORT || 8083;
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Microservicio de Mantenimiento iniciado', { request_id: '-', port: PORT });
});
