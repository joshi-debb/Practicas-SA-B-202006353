// controllers/chatController.js
const { parseMessage } = require('../utils/messageParser');

// ----- micro-servicios ------------------------------------------------------
const equiposService = require('../services/equiposService');        // REST
const mantenimientoService = require('../services/mantenimientoService'); // GraphQL
const ubicacionesService = require('../services/ubicacionesService');   // REST
const reportesService = require('../services/reportesService');      // GraphQL

exports.handleMessage = async (req, res) => {
  const { message } = req.body;
  const { intent, entities } = parseMessage(message);

  try {
    switch (intent) {

      /* ─────────── SALUDO ─────────── */
      case 'greeting':
        return res.json({ intent, reply: '¡Hola! ¿En qué puedo ayudarte hoy?' });

      /* ========== EQUIPOS  (REST) ========== */
      case 'list_equipos': {
        const { data } = await equiposService.list();
        return res.json({ intent, reply: data });
      }
      case 'add_equipo': {
        const { data } = await equiposService.add(entities.attrs);
        return res.json({ intent, reply: data });
      }
      case 'update_equipo': {
        const { data } = await equiposService.update(entities.id, entities.attrs);
        return res.json({ intent, reply: data });
      }
      case 'delete_equipo': {
        const { data } = await equiposService.remove(entities.id);
        return res.json({ intent, reply: data });
      }


      /* ========== MANTENIMIENTOS  (GraphQL) ========== */
      case 'list_mantenimientos': {
        const { data } = await mantenimientoService.list();
        return res.json({ intent, reply: data.data.obtenerMantenimientos });
      }
      case 'add_mantenimiento': {
        const { equipo_id, descripcion, estado } = entities.attrs;
        const { data } = await mantenimientoService.add(
          parseInt(equipo_id, 10),
          descripcion,
          estado
        );
        return res.json({ intent, reply: data.data.agregarMantenimiento });
      }
      case 'update_mantenimiento': {
        const { estado } = entities.attrs;
        const { data } = await mantenimientoService.update(entities.id, estado);
        return res.json({ intent, reply: data.data.actualizarEstado });
      }
      case 'delete_mantenimiento': {
        const { data } = await mantenimientoService.remove(entities.id);
        return res.json({ intent, reply: data.data.eliminarMantenimiento });
      }


      /* ========== UBICACIONES  (REST) ========== */
      case 'list_ubicaciones': {
        const { data } = await ubicacionesService.list();
        return res.json({ intent, reply: data });
      }
      case 'add_ubicacion': {
        const { data } = await ubicacionesService.add(entities.attrs);
        return res.json({ intent, reply: data });
      }
      case 'update_ubicacion': {
        const { data } = await ubicacionesService.update(entities.id, entities.attrs);
        return res.json({ intent, reply: data });
      }
      case 'delete_ubicacion': {
        const { data } = await ubicacionesService.remove(entities.id);
        return res.json({ intent, reply: data });
      }


      /* ========== REPORTES  (GraphQL) ========== */
      case 'list_reportes': {
        const { data } = await reportesService.list();
        return res.json({ intent, reply: data.data.obtenerReportes });
      }
      case 'add_reporte': {
        const { equipo_id, titulo, descripcion } = entities.attrs;
        const { data } = await reportesService.add(
          parseInt(equipo_id, 10),
          titulo,
          descripcion
        );
        return res.json({ intent, reply: data.data.agregarReporte });
      }
      case 'update_reporte': {
        // entities.attrs debe cumplir con tu ReporteInput del schema
        const { data } = await reportesService.update(entities.id, entities.attrs);
        return res.json({ intent, reply: data.data.actualizarReporte });
      }
      case 'delete_reporte': {
        const { data } = await reportesService.remove(entities.id);
        return res.json({ intent, reply: data.data.eliminarReporte });
      }


      /* ─────────── INTENTO NO RECONOCIDO ─────────── */
      default:
        return res.json({
          intent: 'unknown',
          reply:
            'No entendí. Ejemplos: "listar equipos", ' +
            '"agrega ubicacion nombre Bodega piso 2 descripcion \\"Oficina central\\"", ' +
            '"actualiza reporte 3 titulo \\"Pantalla reparada\\"".'
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
