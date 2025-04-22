import logging
from flask import Blueprint, request, jsonify
from connections.database import (
    obtener_ubicaciones,
    obtener_ubicacion_por_id,
    agregar_ubicacion,
    actualizar_ubicacion,
    eliminar_ubicacion
)

logger = logging.getLogger(__name__)
ubicaciones_bp = Blueprint("ubicaciones", __name__)

@ubicaciones_bp.route("/ubicaciones/", methods=["GET"])
@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["GET"])
def obtener(id=None):
    logger.info("GET /ubicaciones/ id=%s", id)
    if id:
        ubicacion = obtener_ubicacion_por_id(id)
        if not ubicacion:
            logger.warning("Ubicación no encontrada id=%s", id)
            return jsonify({"mensaje": "Ubicación no encontrada"}), 404
        return jsonify(ubicacion)
    lista = obtener_ubicaciones()
    logger.info("Se obtuvieron %d ubicaciones", len(lista))
    return jsonify(lista)

@ubicaciones_bp.route("/ubicaciones/", methods=["POST"])
def agregar():
    data = request.get_json()
    logger.info("POST /ubicaciones/ payload=%s", data)
    result = agregar_ubicacion(
        data["nombre"], data["direccion"], data["responsable"]
    )
    return jsonify(result), 201

@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    logger.info("PUT /ubicaciones/%s payload=%s", id, data)
    result = actualizar_ubicacion(
        id, data["nombre"], data["direccion"], data["responsable"]
    )
    return jsonify(result)

@ubicaciones_bp.route("/ubicaciones/<int:id>", methods=["DELETE"])
def eliminar(id):
    logger.info("DELETE /ubicaciones/%s", id)
    result = eliminar_ubicacion(id)
    return jsonify(result)