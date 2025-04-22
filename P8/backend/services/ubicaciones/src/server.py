import sys
import logging
from pythonjsonlogger import jsonlogger
from flask import Flask
from flask_cors import CORS
from routes.ubicaciones import ubicaciones_bp

# ——— Configuración de logging ——————————————————
logger = logging.getLogger()
logger.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(levelname)s %(name)s %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
# ——————————————————————————————————————————

app = Flask(__name__)
# Que Flask use el mismo logger estructurado
app.logger.handlers = logger.handlers
app.logger.setLevel(logger.level)

CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(ubicaciones_bp)

if __name__ == "__main__":
    logger.info(
        "Iniciando microservicio Ubicaciones",
        extra={"host": "0.0.0.0", "port": 8082}
    )
    app.run(host="0.0.0.0", port=8082, debug=False)