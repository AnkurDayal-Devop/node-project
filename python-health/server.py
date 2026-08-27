"""Flask application for the Python health-check service."""

from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, send_from_directory

HOST = "0.0.0.0"
PORT = 8000
BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__)


@app.get("/")
def health_page():
    """Serve the human-friendly Python service health page."""
    return send_from_directory(BASE_DIR, "health.html")


@app.get("/health")
def health_check():
    """Return a machine-readable status response."""
    return jsonify(
        status="healthy",
        service="python-health",
        checked_at=datetime.now(timezone.utc).isoformat(),
    )


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
