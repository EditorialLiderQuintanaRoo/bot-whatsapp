const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const fs = require('fs');

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '22.04'],
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      const filePath = './qr.png';
      await qrcode.toFile(filePath, qr);
      console.log('\n📷 Escanea el código QR desde el archivo generado.');

      console.log('❗ Abre este archivo en tu computadora para escanearlo: qr.png');
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp');
    }

    if (connection === 'close') {
      const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== 401;
      console.log('❌ Conexión cerrada, reconectando...', shouldReconnect);
      if (shouldReconnect) {
        iniciarBot();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

iniciarBot();
