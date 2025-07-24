import http.server

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy',  'same-origin')
        super().end_headers()

def run(server_class=http.server.HTTPServer, handler_class=CustomHTTPRequestHandler):
    server_address = ('', 8000) 
    httpd = server_class(server_address, handler_class)
    print("Starting server on port 8000...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
