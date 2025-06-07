import * as http from 'http';
import { forward, Listener } from '@ngrok/ngrok';

export class SourceAnalyzer {
  private server: http.Server | null = null;
  private ngrokUrl: string | null = null;
  private ngrokListener: Listener | null = null;
  private port: number = 0;

  async createServer(source: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(source);
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      // Listen on random available port
      this.server.listen(0, '127.0.0.1', async () => {
        try {
          const address = this.server!.address();
          if (typeof address === 'object' && address !== null) {
            this.port = address.port;
            
            // Connect to ngrok using new API
            this.ngrokListener = await forward({
              addr: this.port,
              authtoken_from_env: true
            });
            this.ngrokUrl = this.ngrokListener.url();
            
            resolve(this.ngrokUrl!);
          } else {
            reject(new Error('Failed to get server address'));
          }
        } catch (error) {
          reject(error);
        }
      });

      this.server.on('error', reject);
    });
  }

  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    // Disconnect ngrok
    if (this.ngrokListener) {
      cleanupPromises.push(
        this.ngrokListener.close().catch((err: Error) => {
          console.error('Error disconnecting ngrok:', err);
        })
      );
      this.ngrokListener = null;
      this.ngrokUrl = null;
    }

    // Close server
    if (this.server) {
      cleanupPromises.push(
        new Promise<void>((resolve) => {
          this.server!.close(() => resolve());
        })
      );
      this.server = null;
    }

    await Promise.all(cleanupPromises);
  }

  getUrl(): string | null {
    return this.ngrokUrl;
  }
}