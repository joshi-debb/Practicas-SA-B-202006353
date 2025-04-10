import unittest
from unittest.mock import patch
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.server import app

class TestEquipos(unittest.TestCase):

    @patch("src.routes.equipos.obtener_equipos")
    def test_obtener_equipos(self, mock_obtener_equipos):
        sample_equipos = [
            {"id": 1, "nombre": "Equipo1", "tipo": "Tipo1", "estado": "Activo", "ubicacion": "Ubicacion1"},
            {"id": 2, "nombre": "Equipo2", "tipo": "Tipo2", "estado": "Inactivo", "ubicacion": "Ubicacion2"}
        ]
        mock_obtener_equipos.return_value = sample_equipos

        with app.test_client() as client:
            response = client.get("/equipos/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), sample_equipos)

    @patch("src.routes.equipos.obtener_equipo_por_id")
    def test_obtener_equipo_por_id_existe(self, mock_obtener_equipo_por_id):
        sample_equipo = {"id": 1, "nombre": "Equipo1", "tipo": "Tipo1", "estado": "Activo", "ubicacion": "Ubicacion1"}
        mock_obtener_equipo_por_id.return_value = sample_equipo

        with app.test_client() as client:
            response = client.get("/equipos/1")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), sample_equipo)

    @patch("src.routes.equipos.obtener_equipo_por_id")
    def test_obtener_equipo_por_id_no_existe(self, mock_obtener_equipo_por_id):
        mock_obtener_equipo_por_id.return_value = None

        with app.test_client() as client:
            response = client.get("/equipos/999")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), {"mensaje": "Equipo no encontrado"})

    @patch("src.routes.equipos.agregar_equipo")
    def test_agregar_equipo(self, mock_agregar_equipo):
        expected_response = {"mensaje": "Equipo agregado exitosamente"}
        mock_agregar_equipo.return_value = expected_response

        nuevo_equipo = {
            "nombre": "EquipoNuevo",
            "tipo": "Tipo3",
            "estado": "Activo",
            "ubicacion": "Ubicacion3"
        }
        with app.test_client() as client:
            response = client.post("/equipos/", json=nuevo_equipo)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)

    @patch("src.routes.equipos.actualizar_equipo")
    def test_actualizar_equipo(self, mock_actualizar_equipo):
        expected_response = {"mensaje": "Equipo actualizado"}
        mock_actualizar_equipo.return_value = expected_response

        datos_actualizados = {
            "nombre": "EquipoActualizado",
            "tipo": "Tipo2",
            "estado": "Inactivo",
            "ubicacion": "Ubicacion4"
        }
        with app.test_client() as client:
            response = client.put("/equipos/1", json=datos_actualizados)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)

    @patch("src.routes.equipos.eliminar_equipo")
    def test_eliminar_equipo(self, mock_eliminar_equipo):
        expected_response = {"mensaje": "Equipo eliminado"}
        mock_eliminar_equipo.return_value = expected_response

        with app.test_client() as client:
            response = client.delete("/equipos/1")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), expected_response)

if __name__ == "__main__":
    unittest.main()

# python3 -m unittest discover -s equipos/test