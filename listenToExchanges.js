const WebSocket = require('ws');
require('dotenv').config();

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const KUCOIN = 'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6';
const BINANCE = '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9';

const ACCOUNTS = [KUCOIN, BINANCE];

const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_KEY}`);

ws.on('open', () => {
  console.log('📡 Подключено к Helius: transactionSubscribe активен');
  ACCOUNTS.forEach((address) => {
    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'transactionSubscribe',
      params: [
        { account: address },
        { commitment: 'confirmed' }
      ]
    }));
  });
});

ws.on('message', (data) => {
  console.log('📦 ВХОДЯЩАЯ ТРАНЗАКЦИЯ ОТ HELIUS (transactionSubscribe):');
  console.log(data);
});

ws.on('close', () => console.log('🔌 WebSocket закрыт'));
ws.on('error', (err) => console.error(`❌ WebSocket ошибка: ${err.message}`));
