# src/connections/database.py
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

def obtener_equipos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM equipos")
    equipos = cursor.fetchall()
    conn.close()
    return equipos

def obtener_equipo_por_id(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM equipos WHERE id = %s", (id,))
    equipo = cursor.fetchone()
    conn.close()
    return equipo

def agregar_equipo(nombre, tipo, estado, ubicacion):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO equipos (nombre, tipo, estado, ubicacion) VALUES (%s, %s, %s, %s)",
        (nombre, tipo, estado, ubicacion),
    )
    conn.commit()
    conn.close()
    return {"mensaje": "Equipo agregado exitosamente"}

def actualizar_equipo(id, nombre, tipo, estado, ubicacion):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE equipos SET nombre = %s, tipo = %s, estado = %s, ubicacion = %s WHERE id = %s",
        (nombre, tipo, estado, ubicacion, id),
    )
    conn.commit()
    conn.close()
    return {"mensaje": "Equipo actualizado"}

def eliminar_equipo(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM equipos WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Equipo eliminado"}
