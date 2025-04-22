# ubicaciones/src/routes/ubicaciones.py
from flask import Blueprint, request, jsonify, current_app
from connections.database import (
    obtener_ubicaciones,
    obtener_ubicacion_por_id,
    agregar_ubicacion,
    actualizar_ubicacion,
    eliminar_ubicacion
)

ubicaciones_bp = Blueprint("ubicaciones", __name__)

@ubicaciones_bp.route("/ubicaciones", methods=["GET"])
@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["GET"])
def obtener(id=None):
    current_app.logger.info(f"GET /ubicaciones id={id}")
    if id:
        ubicacion = obtener_ubicacion_por_id(id)
        if not ubicacion:
            current_app.logger.warning(f"Ubicación no encontrada id={id}")
            return jsonify({"mensaje": "Ubicación no encontrada"}), 404
        return jsonify(ubicacion)
    lista = obtener_ubicaciones()
    current_app.logger.info(f"Se obtuvieron {len(lista)} ubicaciones")
    return jsonify(lista)

@ubicaciones_bp.route("/ubicaciones", methods=["POST"])
def agregar():
    data = request.get_json()
    current_app.logger.info(f"POST /ubicaciones payload={data}")
    result = agregar_ubicacion(data["nombre"], data["direccion"], data["responsable"])
    return jsonify(result), 201

@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    current_app.logger.info(f"PUT /ubicaciones/{id} payload={data}")
    result = actualizar_ubicacion(id, data["nombre"], data["direccion"], data["responsable"])
    return jsonify(result)

@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["DELETE"])
def eliminar(id):
    current_app.logger.info(f"DELETE /ubicaciones/{id}")
    result = eliminar_ubicacion(id)
    return jsonify(result)
