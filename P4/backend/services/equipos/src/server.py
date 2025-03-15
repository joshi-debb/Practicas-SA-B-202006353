from flask import Flask
from routes.equipos import equipos_bp

app = Flask(__name__)

# Registrar Blueprint de equipos
app.register_blueprint(equipos_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True)
