import sys
import uuid
import time
import logging
from flask import Flask, g, has_request_context, request
from pythonjsonlogger import jsonlogger
from routes.equipos import equipos_bp

class RequestIDFilter(logging.Filter):
    def filter(self, record):
        # intentamos leer g.request_id sólo si hay contexto,
        # y capturamos cualquier RuntimeError que salga de g.
        try:
            if has_request_context():
                record.request_id = getattr(g, "request_id", "-")
            else:
                record.request_id = "-"
        except RuntimeError:
            record.request_id = "-"
        return True

def setup_json_logging():
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIDFilter())
    fmt = '%(asctime)s %(levelname)s %(name)s %(request_id)s %(message)s'
    handler.setFormatter(jsonlogger.JsonFormatter(fmt))
    root.addHandler(handler)

def create_app():
    app = Flask(__name__)
    setup_json_logging()

    @app.before_request
    def before():
        g.request_id = str(uuid.uuid4())
        g.start_time = time.time()

    @app.after_request
    def after(response):
        dur_ms = int((time.time() - g.start_time) * 1000)
        meta = {
            "req": {
                "headers": dict(request.headers),
                "httpVersion": request.environ.get("SERVER_PROTOCOL"),
                "method": request.method,
                "originalUrl": request.path,
                "query": request.args.to_dict(),
                "url": request.full_path.rstrip("?")
            },
            "res": {"statusCode": response.status_code},
            "responseTime": dur_ms
        }
        logging.getLogger().info(
            f"{request.method} {request.path} {response.status_code} {dur_ms}ms",
            extra={"service": "equipos-python", "meta": meta}
        )
        return response

    app.register_blueprint(equipos_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    # Este log ya no fallará porque el filtro atrapa el RuntimeError
    logging.getLogger().info("Iniciando microservicio Equipos", extra={"service": "equipos-python"})
    app.run(host="0.0.0.0", port=8081)
