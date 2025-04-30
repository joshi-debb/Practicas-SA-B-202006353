// services/reportesService.js
const axios = require('axios');

/**
 * BASE_URL_REPORTES se define en tu .env, por ejemplo:
 *   BASE_URL_REPORTES=http://reportes:8084/reportes/
 *   (la URL debe apuntar al endpoint GraphQL del microservicio)
 */
const BASE_URL_REPORTES = process.env.BASE_URL_REPORTES;

/* Helper genérico para enviar queries / mutations */
const gql = (query, variables = {}) =>
  axios.post(
    BASE_URL_REPORTES,
    { query, variables },
    { headers: { 'Content-Type': 'application/json' } }
  );

/* ───────── Consultar ───────── */
exports.list = () =>
  gql(`{
        obtenerReportes {
          id
          equipo_id
          titulo
          descripcion
          fecha
        }
      }`);

/* ───────── Agregar ───────── */
exports.add = (equipo_id, titulo, descripcion) =>
  gql(
    `mutation ($equipo_id:Int!, $titulo:String!, $descripcion:String!) {
       agregarReporte(
         equipo_id: $equipo_id,
         titulo:    $titulo,
         descripcion:$descripcion
       ) {
         id
         equipo_id
         titulo
         descripcion
         fecha
       }
     }`,
    { equipo_id, titulo, descripcion }
  );

/* ───────── Actualizar ─────────
   Usa un input de tipo ReporteInput definido en tu schema GraphQL */
exports.update = (id, inputObj) =>
  gql(
    `mutation ($id:ID!, $input:ReporteInput!) {
       actualizarReporte(id:$id, input:$input) {
         id
         equipo_id
         titulo
         descripcion
         fecha
       }
     }`,
    { id, input: inputObj }
  );

/* ───────── Eliminar ───────── */
exports.remove = id =>
  gql(
    `mutation ($id:ID!) {
       eliminarReporte(id:$id)
     }`,
    { id }
  );
