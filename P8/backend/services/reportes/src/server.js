require("dotenv").config();
const express = require("express");
const cors = require("cors");
const expressWinston = require("express-winston");
const logger = require("./logger");             // <— tu logger.js
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");

// Conexión a MySQL
const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT
});

// Esquema GraphQL
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

// Resolvers
const root = {
  obtenerReportes: async () => {
    logger.info("Resolver obtenerReportes");
    const [rows] = await db.query("SELECT * FROM reportes");
    return rows;
  },
  obtenerReportePorTipo: async ({ tipo }) => {
    logger.info(`Resolver obtenerReportePorTipo tipo=${tipo}`);
    const [rows] = await db.query(
      "SELECT * FROM reportes WHERE tipo = ?",
      [tipo]
    );
    return rows;
  },
  generarReporte: async ({ tipo, descripcion }) => {
    logger.info(`Resolver generarReporte tipo=${tipo}`);
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
  eliminarReporte: async ({ id }) => {
    logger.info(`Resolver eliminarReporte id=${id}`);
    const [result] = await db.query(
      "DELETE FROM reportes WHERE id = ?",
      [id]
    );
    return result.affectedRows ? "Reporte eliminado" : "Reporte no encontrado";
  }
};

const app = express();

// Logger de peticiones (HTTP + GraphQL)
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  expressFormat: true,
  colorize: false
}));

app.use(cors({
  origin: "*",
  methods: "GET,POST",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json());

const graphqlHandler = createHandler({
  schema,
  rootValue: root
});
app.all("/reportes/", graphqlHandler);

// Logger de errores
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

const PORT = process.env.PORT || 8084;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Microservicio de Reportes iniciado en puerto ${PORT}`);
});
