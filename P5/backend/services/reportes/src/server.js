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


// Resolvers de GraphQL
const root = {
    obtenerReportes: async () => {
        const [rows] = await db.query("SELECT * FROM reportes");
        return rows;
    },

    obtenerReportePorTipo: async ({ tipo }) => { 
        const [rows] = await db.query("SELECT * FROM reportes WHERE tipo = ?", [tipo]);
        return rows;
    },

    generarReporte: async ({ tipo, descripcion }) => {
        const [result] = await db.query(
            "INSERT INTO reportes (tipo, descripcion) VALUES (?, ?)",
            [tipo, descripcion]
        );
        
        const [nuevoReporte] = await db.query(
            "SELECT * FROM reportes WHERE id = ?",
            [result.insertId]
        );
    
        return nuevoReporte[0];
    },

    eliminarReporte: async ({ id }) => {
        const [result] = await db.query("DELETE FROM reportes WHERE id = ?", [id]);
        return result.affectedRows ? "Reporte eliminado" : "Reporte no encontrado";
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

const PORT = process.env.PORT || 8084;
app.listen(PORT, "0.0.0.0", () => console.log(`Microservicio de Reportes corriendo en puerto ${PORT}`));