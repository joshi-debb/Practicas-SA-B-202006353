from flask import Flask
from flask_cors import CORS 
from routes.equipos import equipos_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(equipos_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True)
