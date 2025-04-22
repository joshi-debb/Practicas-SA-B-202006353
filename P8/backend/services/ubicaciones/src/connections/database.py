# ubicaciones/src/connections/database.py
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": os.getenv("DB_PORT"),
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

def obtener_ubicaciones():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ubicaciones")
    ubicaciones = cursor.fetchall()
    conn.close()
    return ubicaciones

def obtener_ubicacion_por_id(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ubicaciones WHERE id = %s", (id,))
    ubicacion = cursor.fetchone()
    conn.close()
    return ubicacion

def agregar_ubicacion(nombre, direccion, responsable):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO ubicaciones (nombre, direccion, responsable) VALUES (%s, %s, %s)",
        (nombre, direccion, responsable),
    )
    conn.commit()
    conn.close()
    return {"mensaje": "Ubicación agregada exitosamente"}

def actualizar_ubicacion(id, nombre, direccion, responsable):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE ubicaciones SET nombre = %s, direccion = %s, responsable = %s WHERE id = %s",
        (nombre, direccion, responsable, id),
    )
    conn.commit()
    conn.close()
    return {"mensaje": "Ubicación actualizada"}

def eliminar_ubicacion(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ubicaciones WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Ubicación eliminada"}
