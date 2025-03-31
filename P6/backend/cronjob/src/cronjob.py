import datetime
import pytz
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

hora_actual = datetime.datetime.now(pytz.timezone('America/Guatemala')).strftime('%Y-%m-%d %H:%M:%S')

# Parámetros desde .env
db_name = os.getenv("DB_NAME")
table_name = "registros"
carne = os.getenv("CARNE")

# Conexión inicial sin seleccionar base de datos
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)
cursor = conn.cursor()

# Crear base de datos si no existe
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
conn.database = db_name  # Selecciona la base de datos

# Crear tabla si no existe
cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha_hora DATETIME,
        carnet VARCHAR(50)
    )
""")

# Insertar registro
query = f"INSERT INTO {table_name} (fecha_hora, carnet) VALUES (%s, %s)"
values = (hora_actual, carne)
cursor.execute(query, values)
conn.commit()

print(f"Registro insertado correctamente con ID: {cursor.lastrowid}")

cursor.close()
conn.close()
