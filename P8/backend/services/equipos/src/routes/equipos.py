from flask import Blueprint, request, current_app, g, jsonify
from connections.database import (
    obtener_equipos, obtener_equipo_por_id,
    agregar_equipo, actualizar_equipo, eliminar_equipo
)

equipos_bp = Blueprint("equipos", __name__)

@equipos_bp.route("/equipos/", methods=["GET"])
@equipos_bp.route("/equipos/<int:id>", methods=["GET"])
def obtener(id=None):
    current_app.logger.info(f"GET /equipos/, id={id}", extra={})
    if id:
        equipo = obtener_equipo_por_id(id)
        if not equipo:
            current_app.logger.warning(f"Equipo no encontrado, id={id}", extra={})
            return jsonify({"mensaje": "Equipo no encontrado"}), 404
        return jsonify(equipo)
    lista = obtener_equipos()
    current_app.logger.info(f"Se obtuvieron {len(lista)} equipos", extra={})
    return jsonify(lista)

@equipos_bp.route("/equipos/", methods=["POST"])
def agregar():
    data = request.get_json()
    current_app.logger.info(f"POST /equipos/ payload={data}", extra={})
    result = agregar_equipo(data["nombre"], data["tipo"],
                            data["estado"], data["ubicacion"])
    return jsonify(result), 201

@equipos_bp.route("/equipos/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    current_app.logger.info(f"PUT /equipos/{id} payload={data}", extra={})
    result = actualizar_equipo(id, data["nombre"],
                               data["tipo"], data["estado"], data["ubicacion"])
    return jsonify(result)

@equipos_bp.route("/equipos/<int:id>", methods=["DELETE"])
def eliminar(id):
    current_app.logger.info(f"DELETE /equipos/{id}", extra={})
    result = eliminar_equipo(id)
    return jsonify(result)
