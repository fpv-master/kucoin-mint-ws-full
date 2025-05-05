const WebSocket = require('ws');
require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const KUCOIN = 'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6';
const BINANCE = '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9';

const ACCOUNTS = [KUCOIN, BINANCE];

const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_KEY}`);

ws.on('open', () => {
  console.log('🧪 DEBUG: Подписка на logsSubscribe (без фильтров)');
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'logsSubscribe',
    params: [
      { mentions: ACCOUNTS },
      { commitment: 'confirmed' }
    ]
  }));
});

ws.on('message', (data) => {
  try {
    console.log('📩 ВХОДЯЩИЕ ЛОГИ ОТ HELIUS:');
    console.log(data);
  } catch (e) {
    console.error(`💥 Ошибка парсинга: ${e.message}`);
  }
});

ws.on('close', () => console.log('🔌 WebSocket закрыт'));
ws.on('error', (err) => console.error(`❌ WebSocket ошибка: ${err.message}`));
