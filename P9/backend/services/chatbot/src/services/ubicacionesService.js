// services/ubicacionesService.js
const axios = require('axios');

/**
 * BASE_URL_UBICACIONES se define en tu .env, por ejemplo:
 *   BASE_URL_UBICACIONES=http://ubicaciones:8082
 */
const BASE_URL_UBICACIONES = process.env.BASE_URL_UBICACIONES;

/* ───────── CRUD básico ───────── */

exports.list = () =>
  axios.get(`${BASE_URL_UBICACIONES}/ubicaciones`);

exports.add = data =>
  axios.post(`${BASE_URL_UBICACIONES}/ubicaciones`, data);

exports.update = (id, data) =>
  axios.put(`${BASE_URL_UBICACIONES}/ubicaciones/${id}`, data);

exports.remove = id =>
  axios.delete(`${BASE_URL_UBICACIONES}/ubicaciones/${id}`);
