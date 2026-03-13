const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const PIX_KEY = 'SUA_CHAVE_PIX_AQUI';

const produtos = {
  1: { nome: 'Produto 1', preco: 5 },
  2: { nome: 'Produto 2', preco: 5 },
  3: { nome: 'Produto 3', preco: 5 },
  4: { nome: 'Produto 4', preco: 5 },
  5: { nome: 'Produto 5', preco: 5 },
  6: { nome: 'Produto 6', preco: 5 },
  7: { nome: 'Produto 7', preco: 5 },
  8: { nome: 'Produto 8', preco: 5 },
  9: { nome: 'Produto 9', preco: 5 },
  10: { nome: 'Produto 10', preco: 5 }
};

let carrinhos = {};

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('Escaneie o QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('BOT ONLINE 🚀');
});

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function menu() {
  return `
este e nosso atendimento automatico get3d

📦 *CATÁLOGO*

1 Produto 1 - R$5
2 Produto 2 - R$5
3 Produto 3 - R$5
4 Produto 4 - R$5
5 Produto 5 - R$5
6 Produto 6 - R$5
7 Produto 7 - R$5
8 Produto 8 - R$5
9 Produto 9 - R$5
10 Produto 10 - R$5

Digite o número do produto para adicionar ao carrinho

Comandos:
menu - ver catálogo
carrinho - ver carrinho
finalizar - pagar pedido
`;
}

client.on('message', async msg => {
  try {
    if (!msg.body) return;

    const texto = msg.body.toLowerCase().trim();
    const user = msg.from;

    if (!carrinhos[user]) {
      carrinhos[user] = [];
    }

    if (texto === 'oi' || texto === 'ola' || texto === 'olá' || texto === 'menu') {
      await client.sendMessage(user, `${saudacao()} 👋\nBem vindo\n${menu()}`);
      return;
    }

    const numero = Number(texto);

    if (produtos[numero]) {
      carrinhos[user].push(produtos[numero]);
      await client.sendMessage(user, `✅ ${produtos[numero].nome} adicionado ao carrinho`);
      return;
    }

    if (texto === 'carrinho') {
      const carrinho = carrinhos[user];

      if (carrinho.length === 0) {
        await client.sendMessage(user, 'Carrinho vazio');
        return;
      }

      let total = 0;
      let lista = '';

      carrinho.forEach((p, i) => {
        lista += `${i + 1} ${p.nome} - R$${p.preco}\n`;
        total += p.preco;
      });

      await client.sendMessage(user, `🛒 *SEU CARRINHO*\n\n${lista}\nTotal: R$${total}`);
      return;
    }

    if (texto === 'finalizar') {
      const carrinho = carrinhos[user];

      if (carrinho.length === 0) {
        await client.sendMessage(user, 'Carrinho vazio');
        return;
      }

      let total = 0;
      carrinho.forEach(p => total += p.preco);

      await client.sendMessage(
        user,
        `💳 *PAGAMENTO PIX*

Total: R$${total}

Chave PIX:
${PIX_KEY}

Após pagar envie o comprovante.

Obrigado pela compra!`
      );

      carrinhos[user] = [];
    }
  } catch (erro) {
    console.error('Erro:', erro);
  }
});

client.initialize();
