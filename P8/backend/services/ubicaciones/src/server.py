# ubicaciones/src/server.py
import sys
import uuid
import logging
from flask import Flask, request, g, has_request_context
from flask_cors import CORS
from pythonjsonlogger import jsonlogger
from routes.ubicaciones import ubicaciones_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # 1) Configuro el logger raíz para salida JSON
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    fmt = '%(asctime)s %(levelname)s %(name)s %(service)s %(request_id)s %(message)s'
    handler.setFormatter(jsonlogger.JsonFormatter(fmt))

    # 2) Filtro para inyectar request_id
    class RequestIDFilter(logging.Filter):
        def filter(self, record):
            if has_request_context():
                record.request_id = getattr(g, "request_id", "-")
            else:
                record.request_id = "-"
            return True

    handler.addFilter(RequestIDFilter())
    root.addHandler(handler)

    # 3) LoggerAdapter para campo 'service'
    adapter = logging.LoggerAdapter(root, {"service": "ubicaciones-python"})
    app.logger = adapter
    app.logger.setLevel(logging.INFO)

    # 4) Generación de request_id y logging de entrada/salida
    @app.before_request
    def start_request():
        g.request_id = str(uuid.uuid4())
        app.logger.info(f"→ Incoming request: {request.method} {request.path}")

    @app.after_request
    def end_request(response):
        app.logger.info(f"← Completed request: {request.method} {request.path} → {response.status_code}")
        return response

    # 5) Registro del blueprint
    app.register_blueprint(ubicaciones_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.logger.info("Iniciando microservicio Ubicaciones")
    app.run(host="0.0.0.0", port=8082, debug=False)
