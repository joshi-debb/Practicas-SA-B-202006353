import datetime
import pytz
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

hora_actual = datetime.datetime.now(pytz.timezone('America/Guatemala')).strftime('%Y-%m-%d %H:%M:%S')

client = MongoClient(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT"))
)

db = client[os.getenv("DB_NAME")]
coleccion = db[os.getenv("DB_COLLECTION")]

registro = {
    "fecha_hora": hora_actual,
    "carnet": os.getenv("CARNE")
}

resultado = coleccion.insert_one(registro)

print(f"Registro insertado correctamente: {resultado.inserted_id}")
