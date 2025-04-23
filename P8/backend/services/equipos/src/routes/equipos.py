# routes/equipos.py
from flask import Blueprint, request, current_app, jsonify
from connections.database import (
    obtener_equipos, obtener_equipo_por_id,
    agregar_equipo, actualizar_equipo, eliminar_equipo
)

equipos_bp = Blueprint("equipos", __name__)

# Quité la barra final en la ruta para que funcione igual con o sin slash
@equipos_bp.route("/equipos", methods=["GET"])
@equipos_bp.route("/equipos/<int:id>", methods=["GET"])
def obtener(id=None):
    current_app.logger.info(f"GET /equipos, id={id}")
    if id is not None:
        equipo = obtener_equipo_por_id(id)
        if not equipo:
            current_app.logger.warning(f"Equipo no encontrado, id={id}")
            return jsonify({"mensaje": "Equipo no encontrado"}), 404
        return jsonify(equipo)
    lista = obtener_equipos()
    current_app.logger.info(f"Se obtuvieron {len(lista)} equipos")
    return jsonify(lista)

@equipos_bp.route("/equipos", methods=["POST"])
def agregar():
    data = request.get_json()
    current_app.logger.info(f"POST /equipos payload={data}")
    result = agregar_equipo(data["nombre"], data["tipo"],
                            data["estado"], data["ubicacion"])
    return jsonify(result), 201

@equipos_bp.route("/equipos/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    current_app.logger.info(f"PUT /equipos/{id} payload={data}")
    result = actualizar_equipo(id, data["nombre"],
                               data["tipo"], data["estado"], data["ubicacion"])
    return jsonify(result)

@equipos_bp.route("/equipos/<int:id>", methods=["DELETE"])
def eliminar(id):
    current_app.logger.info(f"DELETE /equipos/{id}")
    result = eliminar_equipo(id)
    return jsonify(result)
