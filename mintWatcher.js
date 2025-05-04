const WebSocket = require('ws');
const { bot } = require('./botInstance');

function watchMint(wallet, label, targetChat) {
  const ws = new WebSocket(`wss://api.mainnet.helius.xyz/v0/transactions-subscribe?api-key=${process.env.HELIUS_API_KEY}`);
  console.log(`✅ [${label}] Начали слежение за ${wallet}`);

  const timer = setTimeout(() => {
    ws.close();
    bot.sendMessage(targetChat, `⌛ [${label}] Mint не найден за 20 часов. Слежение остановлено.`, { parse_mode: 'HTML' });
  }, 20 * 60 * 60 * 1000); // 20 часов

  ws.on('open', () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      accounts: [wallet],
      commitment: 'confirmed'
    }));
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.description?.includes('InitializeMint')) {
      ws.close();
      clearTimeout(timer);
      const txId = msg.signature;
      const contract = msg.description.match(/mint: ([A-Za-z0-9]+)/)?.[1] || 'неизвестно';
      bot.sendMessage(targetChat,
        `✅ [${label}] Произведён mint токена!\n🧾 Контракт: <code>${contract}</code>\n🔗 https://solscan.io/tx/${txId}`,
        { parse_mode: 'HTML' });
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Mint-слежение закрыто для ${wallet}`);
  });

  ws.on('error', (e) => {
    console.error(`💥 Mint WebSocket ошибка: ${e.message}`);
  });
}

module.exports = { watchMint };
