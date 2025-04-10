import unittest
from unittest.mock import patch
import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.server import app

class TestUbicaciones(unittest.TestCase):

    @patch("src.routes.ubicaciones.obtener_ubicaciones")
    def test_obtener_ubicaciones(self, mock_obtener_ubicaciones):
        sample_ubicaciones = [
            {"id": 1, "nombre": "Ubicacion1", "direccion": "Direccion1", "responsable": "Responsable1"},
            {"id": 2, "nombre": "Ubicacion2", "direccion": "Direccion2", "responsable": "Responsable2"}
        ]
        mock_obtener_ubicaciones.return_value = sample_ubicaciones

        with app.test_client() as client:
            response = client.get("/ubicaciones/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), sample_ubicaciones)

    @patch("src.routes.ubicaciones.obtener_ubicacion_por_id")
    def test_obtener_ubicacion_por_id_existe(self, mock_obtener_ubicacion_por_id):
        sample_ubicacion = {"id": 1, "nombre": "Ubicacion1", "direccion": "Direccion1", "responsable": "Responsable1"}
        mock_obtener_ubicacion_por_id.return_value = sample_ubicacion

        with app.test_client() as client:
            response = client.get("/ubicaciones/1")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), sample_ubicacion)

    @patch("src.routes.ubicaciones.obtener_ubicacion_por_id")
    def test_obtener_ubicacion_por_id_no_existe(self, mock_obtener_ubicacion_por_id):
        mock_obtener_ubicacion_por_id.return_value = None

        with app.test_client() as client:
            response = client.get("/ubicaciones/999")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), {"mensaje": "Ubicación no encontrada"})

    @patch("src.routes.ubicaciones.agregar_ubicacion")
    def test_agregar_ubicacion(self, mock_agregar_ubicacion):
        expected_response = {"mensaje": "Ubicación agregada exitosamente"}
        mock_agregar_ubicacion.return_value = expected_response

        nueva_ubicacion = {
            "nombre": "NuevaUbicacion",
            "direccion": "NuevaDireccion",
            "responsable": "NuevoResponsable"
        }
        with app.test_client() as client:
            response = client.post("/ubicaciones/", json=nueva_ubicacion)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)

    @patch("src.routes.ubicaciones.actualizar_ubicacion")
    def test_actualizar_ubicacion(self, mock_actualizar_ubicacion):
        expected_response = {"mensaje": "Ubicación actualizada"}
        mock_actualizar_ubicacion.return_value = expected_response

        datos_actualizados = {
            "nombre": "Actualizada",
            "direccion": "DireccionActualizada",
            "responsable": "ResponsableActualizado"
        }
        with app.test_client() as client:
            response = client.put("/ubicaciones/1", json=datos_actualizados)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)

    @patch("src.routes.ubicaciones.eliminar_ubicacion")
    def test_eliminar_ubicacion(self, mock_eliminar_ubicacion):
        expected_response = {"mensaje": "Ubicación eliminada"}
        mock_eliminar_ubicacion.return_value = expected_response

        with app.test_client() as client:
            response = client.delete("/ubicaciones/1")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)


if __name__ == '__main__':
    unittest.main()

# python3 -m unittest discover -s ubicaciones/test