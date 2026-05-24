import express from 'express';
import mc from 'minecraft-protocol';

const app = express();
const PORT = process.env.PORT || 3000;

const SERVER_HOST = '5.83.140.209';
const SERVER_PORT = 25627;
const TIMEOUT_MS = 10000; // 10 секунд таймаут

// Разрешаем CORS для вашего сайта на GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/status', async (req, res) => {
  try {
    const data = await pingServer();
    res.json(data);
  } catch (err) {
    res.status(503).json({ online: false, error: err.message });
  }
});

function pingServer() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Таймаут ${TIMEOUT_MS / 1000} сек`));
    }, TIMEOUT_MS);

    mc.ping({
      host: SERVER_HOST,
      port: SERVER_PORT,
      timeout: TIMEOUT_MS,
    }, (err, response) => {
      clearTimeout(timeout);
      if (err) return reject(err);
      resolve({
        online: true,
        players: response?.players?.online ?? 0,
        maxPlayers: response?.players?.max ?? 0,
        version: response?.version?.name ?? 'unknown',
        motd: response?.description?.text ?? response?.description ?? '',
        latency: response?.latency ?? null
      });
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
