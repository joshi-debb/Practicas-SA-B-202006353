const express = require('express')
const queries = require('../connections/database')

const router = express.Router()

router.get('/', async (req, res) => {
  const equipos = await queries.all()
  res.json(equipos)
});

router.post('/', async (req, res) => {
    const { nombre, tipo, estado, ubicacion } = req.body
    const result = await queries.insert(nombre, tipo, estado, ubicacion)
    res.json({ message: 'Equipo creado', id: result.insertId });
});

router.put('/:id', async (req, res) => {
    const { nombre, tipo, estado, ubicacion } = req.body
    const result = await queries.update(req.params.id, nombre, tipo, estado, ubicacion)
    res.json({ message: 'Equipo actualizado', id: result.insertId });
});

router.delete('/:id', async (req, res) => {
    const result = await queries.remove(req.params.id)
    res.json({ message: 'Equipo eliminado', id: result.insertId });
});

module.exports = router
