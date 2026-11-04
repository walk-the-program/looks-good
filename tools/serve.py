#!/usr/bin/env python3
"""Serve Looks Good on 127.0.0.1 and open it in the default browser.
Standard library only. Tries port 8765, then the next 20 if it is busy.
Usage: python3 tools/serve.py [--no-browser] [--port N]"""
import http.server, os, socketserver, sys, threading, webbrowser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TYPES = {  # fixed, because Windows registries often map .js/.svg wrongly
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
    ".otf": "font/otf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8",
}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def guess_type(self, path):
        return TYPES.get(os.path.splitext(path)[1].lower()) or super().guess_type(path)
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()
    def log_message(self, *a):
        pass

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = False

def main():
    args = sys.argv[1:]
    start = int(args[args.index("--port") + 1]) if "--port" in args else 8765
    httpd = None
    for port in range(start, start + 21):
        try:
            httpd = Server(("127.0.0.1", port), Handler)
            break
        except OSError:
            continue
    if httpd is None:
        sys.exit("Could not find a free port near %d." % start)
    url = "http://127.0.0.1:%d/" % httpd.server_address[1]
    print("Looks Good is running at " + url)
    print("Leave this window open while you use it. Press Ctrl+C (or close the window) to stop.")
    if "--no-browser" not in args:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
