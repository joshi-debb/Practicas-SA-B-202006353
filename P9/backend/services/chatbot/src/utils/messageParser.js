// utils/messageParser.js
// ------------- nuevo parser -------------
const kvParser = require('./kvParser');   // recuerda crear utils/kvParser.js

// Normaliza a singular / plural
const normalize = word => {
  const map = {
    equipo: 'equipo',  equipos: 'equipo',
    mantenimiento: 'mantenimiento',  mantenimientos: 'mantenimiento',
    reporte: 'reporte',  reportes: 'reporte',
    ubicacion: 'ubicacion',  ubicaciones: 'ubicacion'
  };
  return map[word] || word;
};

const toPlural = base => ({
  equipo: 'equipos',
  mantenimiento: 'mantenimientos',
  reporte: 'reportes',
  ubicacion: 'ubicaciones'
}[base]);

module.exports.parseMessage = message => {
  const msg = message.toLowerCase().trim();

  /* ---------- Saludo ---------- */
  if (/^(hola|buen(?:os días|as tardes|as noches))/.test(msg)) {
    return { intent: 'greeting', entities: {} };
  }

  /* ---------- Listar ---------- */
  const listRx = /^listar\s+(equipos?|mantenimientos?|reportes?|ubicaciones?)$/;
  let m = msg.match(listRx);
  if (m) {
    const base = normalize(m[1]);
    return { intent: `list_${toPlural(base)}`, entities: {} };
  }

  /* ---------- Agregar ---------- */
  const addRx = /^agrega\s+(equipos?|mantenimientos?|reportes?|ubicaciones?)\s+(.+)/;
  m = msg.match(addRx);
  if (m) {
    const base = normalize(m[1]);
    console.log(base);
    return {
      intent: `add_${base}`,
      entities: { attrs: kvParser(m[2]) }
    };
  }

  /* ---------- Actualizar ---------- */
  const updRx = /^actualiza\s+(equipos?|mantenimientos?|reportes?|ubicaciones?)\s+(\d+)\s+(.+)$/;
  m = msg.match(updRx);
  if (m) {
    const base = normalize(m[1]);
    return {
      intent: `update_${base}`,
      entities: { id: m[2], attrs: kvParser(m[3]) }
    };
  }

  /* ---------- Eliminar ---------- */
  const delRx = /^elimina\s+(equipos?|mantenimientos?|reportes?|ubicaciones?)\s+(\d+)$/;
  m = msg.match(delRx);
  if (m) {
    const base = normalize(m[1]);
    return { intent: `delete_${base}`, entities: { id: m[2] } };
  }

  return { intent: 'unknown', entities: {} };
};
