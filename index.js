const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL;

const { bot } = require('./botInstance');

bot.setWebHook(`${URL}/telegram`);

app.post('/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (_, res) => {
  res.send('✅ Kucoin Mint Tracker is live (Webhook + Helius WS)');
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook + Helius listening on port ${PORT}`);
});

// подключаем Helius-слушатель
require('./listenToExchanges');
