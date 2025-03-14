require("dotenv").config();
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mysql = require("mysql2/promise");
const cors = require("cors");

// Conectar a MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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

// Configurar Express con GraphQL
const app = express();
app.use(cors());
app.use("/graphql", graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}));

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Microservicio de Mantenimiento corriendo en puerto ${PORT}`));
