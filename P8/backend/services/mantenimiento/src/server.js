require("dotenv").config();
const express = require("express");
const cors = require("cors");
const expressWinston = require("express-winston");
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");
const logger = require("./logger");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const app = express();

// Logging de solicitudes HTTP
app.use(express.json());
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false
}));

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ——— Esquema y resolvers ———
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

const root = {
  obtenerMantenimientos: async () => {
    logger.info("Resolver obtenerMantenimientos");
    const [rows] = await db.query("SELECT * FROM mantenimientos");
    return rows;
  },
  agregarMantenimiento: async ({ equipo_id, descripcion, estado }) => {
    logger.info("Resolver agregarMantenimiento", { equipo_id, descripcion, estado });
    const [result] = await db.query(
      "INSERT INTO mantenimientos (equipo_id, descripcion, estado) VALUES (?, ?, ?)",
      [equipo_id, descripcion, estado]
    );
    return { id: result.insertId, equipo_id, descripcion, estado };
  },
  actualizarEstado: async ({ id, estado }) => {
    logger.info("Resolver actualizarEstado", { id, estado });
    const [result] = await db.query(
      "UPDATE mantenimientos SET estado = ? WHERE id = ?",
      [estado, id]
    );
    return result.affectedRows
      ? "Estado actualizado con éxito"
      : "Mantenimiento no encontrado";
  },
  eliminarMantenimiento: async ({ id }) => {
    logger.info("Resolver eliminarMantenimiento", { id });
    const [result] = await db.query(
      "DELETE FROM mantenimientos WHERE id = ?",
      [id]
    );
    return result.affectedRows
      ? "Mantenimiento eliminado"
      : "Mantenimiento no encontrado";
  }
};

app.all("/mantenimiento/", createHandler({ schema, rootValue: root }));

// Logging de errores en GraphQL
app.use(expressWinston.errorLogger({ winstonInstance: logger }));

const PORT = process.env.PORT || 8083;
app.listen(PORT, "0.0.0.0", () => {
  logger.info("Microservicio de Mantenimiento iniciado", { port: PORT });
});
