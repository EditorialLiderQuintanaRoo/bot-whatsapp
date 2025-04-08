const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '22.04'],
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    
    if (qr) {
      const qrImage = await require('qrcode').toDataURL(qr);
      console.log('\n📸 Escanea este código QR desde tu navegador:');
      console.log(qrImage); // te dará una imagen base64 (data:image/png...)
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp');
    }

    if (connection === 'close') {
      const shouldReconnect = (update.lastDisconnect.error = Boom)?.output?.statusCode !== 401;
      console.log('❌ Conexión cerrada, reconectando...', shouldReconnect);
      if (shouldReconnect) {
        iniciarBot();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

iniciarBot();
