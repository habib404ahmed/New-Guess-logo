process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import logosHandler from './api/logos.js';
import moviesHandler from './api/movies.js';
import settingsHandler from './api/settings.js';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/logos')) {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const query = Object.fromEntries(urlObj.searchParams.entries());
          let body: any = null;
          if (req.method === 'POST' || req.method === 'PUT') {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            try {
              body = JSON.parse(dataStr);
            } catch {
              body = null;
            }
          }

          const vercelReq: any = { method: req.method, query, body, url: req.url };
          const vercelRes: any = {
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status: (code: number) => {
              res.statusCode = code;
              return vercelRes;
            },
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            end: () => res.end(),
          };

          try {
            await logosHandler(vercelReq, vercelRes);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url?.startsWith('/api/movies')) {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const query = Object.fromEntries(urlObj.searchParams.entries());
          let body: any = null;
          if (req.method === 'POST' || req.method === 'PUT') {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            try {
              body = JSON.parse(dataStr);
            } catch {
              body = null;
            }
          }

          const vercelReq: any = { method: req.method, query, body, url: req.url };
          const vercelRes: any = {
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status: (code: number) => {
              res.statusCode = code;
              return vercelRes;
            },
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            end: () => res.end(),
          };

          try {
            await moviesHandler(vercelReq, vercelRes);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url?.startsWith('/api/settings')) {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const query = Object.fromEntries(urlObj.searchParams.entries());
          let body: any = null;
          if (req.method === 'POST' || req.method === 'PUT') {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            try {
              body = JSON.parse(dataStr);
            } catch {
              body = null;
            }
          }

          const vercelReq: any = { method: req.method, query, body, url: req.url };
          const vercelRes: any = {
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status: (code: number) => {
              res.statusCode = code;
              return vercelRes;
            },
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            end: () => res.end(),
          };

          try {
            await settingsHandler(vercelReq, vercelRes);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
});
