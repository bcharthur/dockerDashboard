# Service/docker_service.py
from Repository.docker_repository import get_snapshot_and_summary
import eventlet

def _background(socketio):
    while True:
        rows, summary = get_snapshot_and_summary()
        socketio.emit('stats', rows)
        socketio.emit('summary', summary)
        socketio.sleep(0.5)

def start_metrics_task(socketio):
    socketio.start_background_task(_background, socketio)   # 100 % eventlet
