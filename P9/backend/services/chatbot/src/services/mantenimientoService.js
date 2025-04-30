// services/mantenimientoService.js
const axios = require('axios');
const BASE_URL_MANT = process.env.BASE_URL_MANTENIMIENTO;  // p.e.: http://mantenimiento:8083/mantenimiento/

const gql = (query, variables = {}) => axios.post(
  BASE_URL_MANT,
  { query, variables },
  { headers: { 'Content-Type': 'application/json' } }
);

exports.list = () =>
  gql(`{ obtenerMantenimientos { id equipo_id descripcion estado fecha } }`);

exports.add = (equipo_id, descripcion, estado) =>
  gql(`mutation ($equipo_id:Int!,$descripcion:String!,$estado:String!)
        { agregarMantenimiento(equipo_id:$equipo_id,descripcion:$descripcion,estado:$estado)
          { id equipo_id descripcion estado } }`,
      { equipo_id, descripcion, estado });

exports.update = (id, estado) =>
  gql(`mutation ($id:ID!,$estado:String!)
        { actualizarEstado(id:$id,estado:$estado) }`,
      { id, estado });

exports.remove = id =>
  gql(`mutation ($id:ID!){ eliminarMantenimiento(id:$id) }`, { id });
