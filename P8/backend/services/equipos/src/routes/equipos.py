import logging
from flask import Blueprint, request, jsonify
from connections.database import (
    obtener_equipos,
    obtener_equipo_por_id,
    agregar_equipo,
    actualizar_equipo,
    eliminar_equipo
)

logger = logging.getLogger(__name__)
equipos_bp = Blueprint("equipos", __name__)

@equipos_bp.route("/equipos/", methods=["GET"])
@equipos_bp.route("/equipos/<int:id>", methods=["GET"])
def obtener(id=None):
    logger.info("GET /equipos/, id=%s", id)
    if id:
        equipo = obtener_equipo_por_id(id)
        if not equipo:
            logger.warning("Equipo no encontrado, id=%s", id)
            return jsonify({"mensaje": "Equipo no encontrado"}), 404
        return jsonify(equipo)
    lista = obtener_equipos()
    logger.info("Se obtuvieron %d equipos", len(lista))
    return jsonify(lista)

@equipos_bp.route("/equipos/", methods=["POST"])
def agregar():
    data = request.get_json()
    logger.info("POST /equipos/ payload=%s", data)
    result = agregar_equipo(
        data["nombre"], data["tipo"], data["estado"], data["ubicacion"]
    )
    return jsonify(result), 201

@equipos_bp.route("/equipos/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    logger.info("PUT /equipos/%s payload=%s", id, data)
    result = actualizar_equipo(
        id, data["nombre"], data["tipo"], data["estado"], data["ubicacion"]
    )
    return jsonify(result)

@equipos_bp.route("/equipos/<int:id>", methods=["DELETE"])
def eliminar(id):
    logger.info("DELETE /equipos/%s", id)
    result = eliminar_equipo(id)
    return jsonify(result)
