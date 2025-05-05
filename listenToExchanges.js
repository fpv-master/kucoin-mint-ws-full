const WebSocket = require('ws');
require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const KUCOIN = 'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6';
const BINANCE = '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9';

const ACCOUNTS = [KUCOIN, BINANCE];

const ws = new WebSocket(`wss://api.helius.xyz/v0/transactions-subscribe?api-key=${HELIUS_KEY}`);

ws.on('open', () => {
  console.log('🧪 DEBUG: Подключено к transactionsSubscribe без фильтрации');
  ws.send(JSON.stringify({
    type: 'subscribe',
    accounts: ACCOUNTS,
    commitment: 'confirmed'
  }));
});

ws.on('message', (data) => {
  console.log('📦 Входящее сообщение от Helius (transactionsSubscribe):');
  console.log(data);
});

ws.on('close', () => console.log('🔌 WebSocket закрыт'));
ws.on('error', (err) => console.error(`❌ WebSocket ошибка: ${err.message}`));
