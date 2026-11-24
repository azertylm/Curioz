import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createRateLimiter, handleScanObject } from './server/curioz.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '16mb' }));

  const scanLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, maxRequests: 40 });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'curioz-alphabette' });
  });

  app.post('/api/curioz/scan', (req, res, next) => scanLimiter.middleware(req, res, next), handleScanObject);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Curioz] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Curioz] Échec du démarrage du serveur:', err);
  process.exit(1);
});
