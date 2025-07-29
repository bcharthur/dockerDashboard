import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO
from Controller.dashboard_controller import dashboard_bp
from Service.docker_service import start_metrics_task

app = Flask(__name__)
app.register_blueprint(dashboard_bp)

socketio = SocketIO(app,
                    async_mode='eventlet',
                    cors_allowed_origins='*',
                    logger=True, engineio_logger=False)

# ▶️  lance la boucle qui émet les stats toutes les 2 s
start_metrics_task(socketio)

if __name__ == '__main__':
    port = 5002
    print(f'🚀  Dashboard sur http://localhost:{port}')
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=True,        # ou False si tu préfères
        use_reloader=False # désactive le reloader pour éviter le double bind
    )


