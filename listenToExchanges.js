const WebSocket = require('ws');
const { watchMint } = require('./mintWatcher');
const { bot } = require('./botInstance');

require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const BINANCE_CHAT_ID = Number(process.env.BINANCE_CHAT_ID);
const PRIVATE_CHAT_ID = Number(process.env.PRIVATE_CHAT_ID);

const KUCOIN_ADDRESS = '6pB5Qk1WbA2uJipjTSyckU9NBz7iYrPKF3nB9uYoJ3vK';

const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_KEY}`);

ws.on('open', () => {
  console.log(`📡 Тест: слушаем ВСЕ переводы с биржи KuCoin: ${KUCOIN_ADDRESS}`);
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'addressSubscribe',
    params: [{ address: KUCOIN_ADDRESS }, { commitment: 'confirmed' }]
  }));
});

ws.on('message', async (data) => {
  try {
    const msg = JSON.parse(data);
    const tx = msg.params?.result?.transaction;
    const instructions = tx?.message?.instructions || [];

    for (const ix of instructions) {
      if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
        const amount = Number(ix.parsed.info.lamports) / 1e9;
        const from = ix.parsed.info.source;
        const to = ix.parsed.info.destination;

        if (from === KUCOIN_ADDRESS) {
          const label = 'Кук-1';
          const summary = `🧪 [${label}] Тестовый перевод ${amount} SOL\n💰 Адрес: <code>${to}</code>\n⏳ Ожидаем mint...`;
          console.log(summary);
          bot.sendMessage(PRIVATE_CHAT_ID, summary, { parse_mode: 'HTML' });

          watchMint(to, label, PRIVATE_CHAT_ID);
        }
      }
    }
  } catch (err) {
    console.error(`❌ WebSocket ошибка: ${err.message}`);
  }
});

ws.on('close', () => {
  console.log(`🔌 WebSocket закрыт для KuCoin`);
});

ws.on('error', (e) => {
  console.error(`💥 WebSocket ошибка: ${e.message}`);
});
