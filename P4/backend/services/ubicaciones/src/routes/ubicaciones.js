const express = require('express')
const queries = require('../connections/database')

const router = express.Router()

router.get('/', async (req, res) => {
  const ubicaciones = await queries.all()
  res.json(ubicaciones)
});

router.post('/', async (req, res) => {
    const { nombre, direccion, responsable } = req.body
    const result = await queries.insert(nombre, direccion, responsable)
    res.json({ message: 'Ubicación creada', id: result.insertId });
    }
);

router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { nombre, direccion, responsable } = req.body
    const result = await queries.update(id, nombre, direccion, responsable)
    res.json({ message: 'Ubicación actualizada', id: result.insertId });
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params
    const result = await queries.remove(id)
    res.json({ message: 'Ubicación eliminada', id: result.insertId });
});

module.exports = router
