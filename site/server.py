#!/usr/bin/env python3
import json
import os
import shutil
import cgi
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote

ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
PORT = 8000


def format_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def safe_file_name(name):
    safe = os.path.basename(name).strip()
    if not safe:
        safe = "arquivo"
    if safe in {".", ".."}:
        safe = "arquivo"
    return safe


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.path = "/index.html"
        if parsed.path == "/api/files":
            self.send_json_files()
            return
        if parsed.path == "/download":
            self.handle_download(parsed)
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/upload":
            self.handle_upload()
            return
        self.send_error(404, "Not Found")

    def send_json_files(self):
        files = []
        for item in sorted(UPLOAD_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
            if item.is_file():
                files.append({
                    "name": item.name,
                    "size": item.stat().st_size,
                    "size_label": format_size(item.stat().st_size),
                    "modified": datetime.fromtimestamp(item.stat().st_mtime).strftime("%d/%m/%Y %H:%M"),
                    "download_url": f"/download?file={item.name}",
                })

        payload = json.dumps(files).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_download(self, parsed):
        params = parse_qs(parsed.query)
        filename = params.get("file", [None])[0]
        if not filename:
            self.send_error(400, "Arquivo não informado")
            return

        safe_name = safe_file_name(unquote(filename))
        target = (UPLOAD_DIR / safe_name).resolve()
        if not str(target).startswith(str(UPLOAD_DIR.resolve())) or not target.exists():
            self.send_error(404, "Arquivo não encontrado")
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Disposition", f'attachment; filename="{safe_name}"')
        self.send_header("Content-Length", str(target.stat().st_size))
        self.end_headers()
        with open(target, "rb") as file:
            shutil.copyfileobj(file, self.wfile)

    def handle_upload(self):
        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data"):
            self.send_response(400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Formato de upload invalido")
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
            },
        )

        uploaded = form.getfirst("arquivo")
        if uploaded is None:
            self.send_response(400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Nenhum arquivo enviado")
            return

        uploaded_file = form["arquivo"]
        if not getattr(uploaded_file, "filename", None):
            self.send_response(400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Nenhum arquivo enviado")
            return

        nome = form.getfirst("nome") or uploaded_file.filename
        final_name = safe_file_name(nome)
        if final_name != uploaded_file.filename:
            base, ext = os.path.splitext(final_name)
            final_name = f"{base}_{int(datetime.now().timestamp())}{ext}"

        target = (UPLOAD_DIR / final_name).resolve()
        if not str(target).startswith(str(UPLOAD_DIR.resolve())):
            self.send_response(403)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Nome de arquivo invalido")
            return

        with open(target, "wb") as output:
            shutil.copyfileobj(uploaded_file.file, output)

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(f"Arquivo enviado com sucesso: {final_name}".encode("utf-8"))

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    print(f"Servidor rodando em http://localhost:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), SiteHandler).serve_forever()
