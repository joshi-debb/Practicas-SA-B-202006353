from flask import Blueprint, request, jsonify
from connections.database import obtener_ubicaciones, obtener_ubicacion_por_id, agregar_ubicacion, actualizar_ubicacion, eliminar_ubicacion

ubicaciones_bp = Blueprint("ubicaciones", __name__)

# Obtener todas las ubicaciones o una por ID
@ubicaciones_bp.route("/ubicaciones/", methods=["GET"])
@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["GET"])
def obtener(id=None):
    if id:
        ubicacion = obtener_ubicacion_por_id(id)
        return jsonify(ubicacion if ubicacion else {"mensaje": "Ubicación no encontrada"})
    return jsonify(obtener_ubicaciones())

# Agregar una nueva ubicación
@ubicaciones_bp.route("/ubicaciones/", methods=["POST"])
def agregar():
    data = request.get_json()
    return jsonify(agregar_ubicacion(data["nombre"], data["direccion"], data["responsable"]))

# Actualizar una ubicación
@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    return jsonify(actualizar_ubicacion(id, data["nombre"], data["direccion"], data["responsable"]))

# Eliminar una ubicación
@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["DELETE"])
def eliminar(id):
    return jsonify(eliminar_ubicacion(id))
