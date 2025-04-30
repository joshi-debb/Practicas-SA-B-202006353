// services/equiposService.js
const axios = require('axios');
const BASE_URL_EQUIPOS = process.env.BASE_URL_EQUIPOS;

exports.list = () => axios.get(`${BASE_URL_EQUIPOS}/equipos`);
exports.add = data => axios.post(`${BASE_URL_EQUIPOS}/equipos`, data);
exports.update = (id, data) => axios.put(`${BASE_URL_EQUIPOS}/equipos/${id}`, data);
exports.remove = id => axios.delete(`${BASE_URL_EQUIPOS}/equipos/${id}`);