from flask import Flask
from routes.ubicaciones import ubicaciones_bp

app = Flask(__name__)

# Registrar Blueprint de ubicaciones
app.register_blueprint(ubicaciones_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8083, debug=True)
