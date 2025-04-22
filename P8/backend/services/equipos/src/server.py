import sys, uuid, logging
from flask import Flask, request, g, has_request_context
from flask_cors import CORS
from pythonjsonlogger import jsonlogger
from routes.equipos import equipos_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Logger raíz
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    fmt = '%(asctime)s %(levelname)s %(name)s %(service)s %(request_id)s %(message)s'
    handler.setFormatter(jsonlogger.JsonFormatter(fmt))

    # Nuevo filtro robusto
    class RequestIDFilter(logging.Filter):
        def filter(self, record):
            if has_request_context():
                record.request_id = getattr(g, "request_id", "-")
            else:
                record.request_id = "-"
            return True

    handler.addFilter(RequestIDFilter())
    root.addHandler(handler)

    # LoggerAdapter para añadir campo service
    app.logger = logging.LoggerAdapter(app.logger, {"service": "equipos-python"})
    app.logger.setLevel(logging.INFO)

    @app.before_request
    def start_request():
        g.request_id = str(uuid.uuid4())
        app.logger.info(f"→ Incoming request: {request.method} {request.path}")

    @app.after_request
    def end_request(response):
        app.logger.info(f"← Completed request: {request.method} {request.path} → {response.status_code}")
        return response

    app.register_blueprint(equipos_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.logger.info("Iniciando microservicio Equipos")
    app.run(host="0.0.0.0", port=8081, debug=False)
