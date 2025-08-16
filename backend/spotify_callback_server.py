#!/usr/bin/env python3
"""
Simple callback server for Spotify OAuth
Run this when you need to authenticate with Spotify
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import webbrowser
import threading

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the callback URL
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        if parsed_url.path == '/callback':
            if 'code' in query_params:
                code = query_params['code'][0]
                print(f"\n✅ SUCCESS! Authorization code received: {code}")
                print("You can now close this window and return to your app.")
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'''
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Spotify Authentication Success</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1DB954; color: white; }
                        .container { max-width: 500px; margin: 0 auto; }
                        h1 { font-size: 2em; margin-bottom: 20px; }
                        p { font-size: 1.2em; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🎉 Success!</h1>
                        <p>Spotify authentication completed successfully!</p>
                        <p>You can now close this window and return to your app.</p>
                    </div>
                    <script>
                        // Store the code for the main application to pick up
                        localStorage.setItem('spotify_auth_code', '%s');
                        // Try to close the window after 3 seconds
                        setTimeout(function() {
                            window.close();
                        }, 3000);
                    </script>
                </body>
                </html>
                ''' % code.encode())
                
                # Store the code globally so the main app can access it
                CallbackHandler.auth_code = code
                
            elif 'error' in query_params:
                error = query_params['error'][0]
                print(f"\n❌ ERROR: {error}")
                
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f'<h1>Error: {error}</h1>'.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

# Global variable to store the auth code
CallbackHandler.auth_code = None

def start_callback_server():
    """Start the callback server"""
    server = HTTPServer(('127.0.0.1', 8888), CallbackHandler)
    print("🚀 Callback server started on http://127.0.0.1:8888")
    print("Waiting for Spotify authentication...")
    
    def serve():
        server.handle_request()  # Handle one request then stop
        server.server_close()
    
    thread = threading.Thread(target=serve)
    thread.daemon = True
    thread.start()
    return server

if __name__ == "__main__":
    start_callback_server()
    input("Press Enter to stop the server...") 