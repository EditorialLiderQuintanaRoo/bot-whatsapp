const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado a WhatsApp');
});

// Ejemplo: ejecutar algo cada 2 minutos (prueba)
cron.schedule('*/2 * * * *', () => {
  console.log('⏰ Ejecutando tarea cada 2 minutos...');
});

client.initialize();
