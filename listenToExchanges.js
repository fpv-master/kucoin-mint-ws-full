const WebSocket = require('ws');
const { watchMint } = require('./mintWatcher'); // Подключи свой watchMint сюда

require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const BINANCE_CHAT_ID = Number(process.env.BINANCE_CHAT_ID);
const PRIVATE_CHAT_ID = Number(process.env.PRIVATE_CHAT_ID);

const EXCHANGE_WALLETS = [
  { address: '6pB5Qk1WbA2uJipjTSyckU9NBr7iYrPKF3nB9uYoJ3vK', label: 'Кук-1' },
  { address: '9vzEF1Da8zh79QdhtL8GvHGFXMfJh6ETKcXYb8KzWQL9', label: 'Бинанс' }
];

EXCHANGE_WALLETS.forEach(({ address, label }) => {
  const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_KEY}`);

  ws.on('open', () => {
    console.log(`📡 Слежение за ${label}: ${address}`);
    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'addressSubscribe',
      params: [
        { address },
        { commitment: 'confirmed' }
      ]
    }));
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      const tx = msg.params?.result?.transaction;
      const instructions = tx?.message?.instructions || [];
      const preBalances = msg.params?.result?.meta?.preBalances || [];
      const postBalances = msg.params?.result?.meta?.postBalances || [];

      for (const ix of instructions) {
        if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
          const amount = Number(ix.parsed.info.lamports) / 1e9;
          const from = ix.parsed.info.source;
          const to = ix.parsed.info.destination;

          if (amount === 99.99 || amount === 68.99 || amount === 99.999) {
            const targetChat = label === 'Бинанс' ? BINANCE_CHAT_ID : PRIVATE_CHAT_ID;
            const summary = `⚠️ [${label}] Обнаружен перевод ${amount} SOL\n💰 Адрес: <code>${to}</code>\n⏳ Ожидаем mint...`;
            console.log(summary);
            require('./botInstance').bot.sendMessage(targetChat, summary, { parse_mode: 'HTML' });

            watchMint(to, label, targetChat); // как в index.js
          }
        }
      }
    } catch (err) {
      console.error(`❌ Ошибка обработки WebSocket: ${err.message}`);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Соединение закрыто для ${label}`);
  });

  ws.on('error', (e) => {
    console.error(`💥 WebSocket ошибка (${label}): ${e.message}`);
  });
});
