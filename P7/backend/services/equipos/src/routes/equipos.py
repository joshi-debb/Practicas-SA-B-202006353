from flask import Blueprint, request, jsonify
from src.connections.database import obtener_equipos, obtener_equipo_por_id, agregar_equipo, actualizar_equipo, eliminar_equipo

equipos_bp = Blueprint("equipos", __name__)

# Obtener todos los equipos o un equipo por ID
@equipos_bp.route("/equipos/", methods=["GET"])
@equipos_bp.route("/equipos/<int:id>", methods=["GET"])
def obtener(id=None):
    if id:
        equipo = obtener_equipo_por_id(id)
        return jsonify(equipo if equipo else {"mensaje": "Equipo no encontrado"})
    return jsonify(obtener_equipos())

# Agregar un nuevo equipo
@equipos_bp.route("/equipos/", methods=["POST"])
def agregar():
    data = request.get_json()
    return jsonify(agregar_equipo(data["nombre"], data["tipo"], data["estado"], data["ubicacion"]))

# Actualizar un equipo
@equipos_bp.route("/equipos/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    return jsonify(actualizar_equipo(id, data["nombre"], data["tipo"], data["estado"], data["ubicacion"]))

# Eliminar un equipo
@equipos_bp.route("/equipos/<int:id>", methods=["DELETE"])
def eliminar(id):
    return jsonify(eliminar_equipo(id))
