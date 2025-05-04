const WebSocket = require('ws');
const { watchMint } = require('./mintWatcher');
const { bot } = require('./botInstance');
require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const BINANCE_CHAT_ID = Number(process.env.BINANCE_CHAT_ID);
const PRIVATE_CHAT_ID = Number(process.env.PRIVATE_CHAT_ID);

const KUCOIN = 'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6';
const BINANCE = '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9';

const ACCOUNTS = [KUCOIN, BINANCE];

const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_KEY}`);

ws.on('open', () => {
  console.log('📡 Подписка на logsSubscribe для биржевых адресов');
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'logsSubscribe',
    params: [
      {
        mentions: ACCOUNTS
      },
      {
        commitment: 'confirmed'
      }
    ]
  }));
});

ws.on('message', async (data) => {
  try {
    const msg = JSON.parse(data);
    if (!msg.params?.result?.value) return;

    const { logs, signature } = msg.params.result.value;
    const logStr = logs.join(' ');

    const isTransfer = logStr.includes('Program log: Instruction: Transfer');
    const matchedAccount = ACCOUNTS.find(acc => logStr.includes(acc));
    if (!isTransfer || !matchedAccount) return;

    const label = matchedAccount === KUCOIN
      ? (logStr.includes('lamports: 68.99') ? 'Кук-3' : 'Кук-1')
      : 'Бинанс';

    const targetChat = (label === 'Бинанс') ? BINANCE_CHAT_ID : PRIVATE_CHAT_ID;

    const short = matchedAccount.slice(0, 4) + '..' + matchedAccount.slice(-4);
    const summary = `⚠️ [${label}] Обнаружен перевод с ${short}\n💰 Ожидаем mint...`;
    console.log(summary);
    bot.sendMessage(targetChat, summary, { parse_mode: 'HTML' });

    watchMint(matchedAccount, label, targetChat);

  } catch (e) {
    console.error(`💥 Ошибка logsSubscribe: ${e.message}`);
  }
});

ws.on('close', () => console.log('🔌 WebSocket закрыт'));
ws.on('error', (err) => console.error(`❌ WebSocket ошибка: ${err.message}`));
