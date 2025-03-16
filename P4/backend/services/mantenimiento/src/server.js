require("dotenv").config();
const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");
const cors = require("cors");

// Conectar a MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Esquema de GraphQL
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

// Resolvers de GraphQL
const root = {
    obtenerMantenimientos: async () => {
        const [rows] = await db.query("SELECT * FROM mantenimientos");
        return rows;
    },

    agregarMantenimiento: async ({ equipo_id, descripcion, estado }) => {
        const [result] = await db.query(
            "INSERT INTO mantenimientos (equipo_id, descripcion, estado) VALUES (?, ?, ?)",
            [equipo_id, descripcion, estado]
        );
        return { id: result.insertId, equipo_id, descripcion, estado };
    },

    actualizarEstado: async ({ id, estado }) => {
        const [result] = await db.query(
            "UPDATE mantenimientos SET estado = ? WHERE id = ?",
            [estado, id]
        );
        return result.affectedRows ? "Estado actualizado con éxito" : "Mantenimiento no encontrado";
    },

    eliminarMantenimiento: async ({ id }) => {
        const [result] = await db.query("DELETE FROM mantenimientos WHERE id = ?", [id]);
        return result.affectedRows ? "Mantenimiento eliminado" : "Mantenimiento no encontrado";
    }
};

const app = express();
app.use(cors({
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type, Authorization"
}));

const graphqlHandler = createHandler({
    schema,
    rootValue: root
});

app.all("/", graphqlHandler);

const PORT = process.env.PORT || 8083;
app.listen(PORT, "0.0.0.0", () => console.log(`Microservicio de Mantenimiento corriendo en puerto ${PORT}`));