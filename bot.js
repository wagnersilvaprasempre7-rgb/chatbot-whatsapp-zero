const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: true,
    protocolTimeout: 120000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

function menu() {
  return `Olá 👋

🛒 *Loja automática*

Digite uma opção:

1 - Produto 1
2 - Produto 2
3 - Produto 3

Ou digite:
menu`;
}

client.on('qr', (qr) => {
  console.log('\nESCANEIE O QR CODE ABAIXO:\n');
  qrcode.generate(qr, { small: false });
});

client.on('loading_screen', (percent, message) => {
  console.log(`Carregando: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
  console.log('WhatsApp autenticado com sucesso.');
});

client.on('ready', async () => {
  console.log('BOT ONLINE 🚀');

  try {
    const state = await client.getState();
    console.log('Estado do cliente:', state);
  } catch (error) {
    console.log('Não foi possível obter o estado do cliente.');
  }
});

client.on('auth_failure', (msg) => {
  console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  console.log('Bot desconectado:', reason);
});

async function responder(msg) {
  if (!msg.body) return;
  if (msg.fromMe) return;

  const texto = msg.body.toLowerCase().trim();
  const user = msg.from;

  console.log(`Mensagem recebida de ${user}: ${texto}`);

  if (texto === 'oi' || texto === 'ola' || texto === 'olá' || texto === 'menu') {
    await client.sendMessage(user, menu());
    return;
  }

  if (texto === '1') {
    await client.sendMessage(user, 'Produto 1 - R$ 10,00');
    return;
  }

  if (texto === '2') {
    await client.sendMessage(user, 'Produto 2 - R$ 20,00');
    return;
  }

  if (texto === '3') {
    await client.sendMessage(user, 'Produto 3 - R$ 30,00');
    return;
  }

  await client.sendMessage(user, 'Digite *menu* para ver as opções.');
}

client.on('message', async (msg) => {
  try {
    await responder(msg);
  } catch (error) {
    console.error('Erro no evento message:', error);
  }
});

client.on('message_create', async (msg) => {
  try {
    if (msg.fromMe) return;
    await responder(msg);
  } catch (error) {
    console.error('Erro no evento message_create:', error);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Promise rejeitada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
});

client.initialize().catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
});
