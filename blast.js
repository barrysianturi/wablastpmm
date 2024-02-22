const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SESSION_DIR = path.join(__dirname, '.wwebjs_auth');

// Fungsi untuk menanyakan user
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (input) => resolve(input));
  })
};

// Fungsi untuk menghapus session
const clearSession = () => {
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmdirSync(SESSION_DIR, { recursive: true });
    console.log('Session cleared.');
  }
};

// Fungsi utama
const main = async () => {
  const answer = await askQuestion('Do you want to use the last session or start a new one? (last/new): ');

  if (answer === 'new') {
    clearSession();
  }

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('Client is ready!');
    // Kode untuk kirim pesan di sini
    
    const parameter = process.argv[2];
    let numbersFilePath;

    if (parameter === 'trial_core') {
      numbersFilePath = path.join(__dirname, '/nomor/nomor_trial_core.txt');
    } else if (parameter === 'trial_cerprak') {
      numbersFilePath = path.join(__dirname, '/nomor/nomor_trial_cerprak.txt');
    } else if (parameter === 'trial_mengajar') {
      numbersFilePath = path.join(__dirname, '/nomor/nomor_trial_mengajar.txt');
    } else if (parameter === 'self') {
      numbersFilePath = path.join(__dirname, '/nomor/nomor_sendiri.txt');
    } else if (parameter === 'final') {
      numbersFilePath = path.join(__dirname, '/nomor/nomor.txt');
    } else {
      console.error('Parameter tidak valid');
      process.exit(1);
    }
    
    const numbers = fs.readFileSync(numbersFilePath,'utf8').split('\r\n').filter(Boolean);

    const nama = fs.readFileSync(path.join(__dirname, '/nama.txt'),'utf8').split('\r\n').filter(Boolean)
    const links = fs.readFileSync(path.join(__dirname, '/links.txt'),'utf8').split('\r\n').filter(Boolean)
    const judul = fs.readFileSync(path.join(__dirname, '/judul.txt'),'utf8').split('\r\n').filter(Boolean)

    if(process.argv[3] === "with_image"){
      const imagePath = './images/' + process.argv[4]; // Ganti dengan path gambar lo
      const imageAsBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
      const image = new MessageMedia('image/jpg', imageAsBase64);

      const messageFilePath = path.join("./pesan/", 'pesan.txt')
      const message = fs.readFileSync(messageFilePath,'utf8').trim();
      
      sendImages(numbers, message, image);
    } else if(process.argv[3] === "revisi"){
      const messageFilePath = path.join("./pesan/", 'pesan.txt')
      const message = fs.readFileSync(messageFilePath,'utf8').trim();
      sendMessageLinks(numbers, message, judul, nama, links);
    } else {
      const messageFilePath = path.join("./pesan/", 'pesan.txt')
      const message = fs.readFileSync(messageFilePath,'utf8').trim();
      sendMessages(numbers, message);
    }
  });

  const sendMessageLinks = (numbers, message, judul, nama, links) => {
    let delay = 2000; // Delay 2 detik
    numbers.forEach((number, index) => {
      setTimeout(() => {
          message_temp = message;
          message_temp = message_temp.replace("{Judul}",judul[index]);
          message_temp = message_temp.replace("{Nama}",nama[index]);
          message_temp = message_temp.replace("{Link}",links[index]);
          number = number.includes('@c.us') ? number : `${number}@c.us`;
          
          client.sendMessage(number, message_temp).then(response => {
              // Pesan terkirim
              console.log(`Message sent to ${number}`);
          }).catch(err => {
              // Ada error saat mengirim, handle di sini
              console.error('Error sending message: ', err);
          });
      }, delay * index); // delay diperbanyak dengan index array
    });
  };

  const sendMessages = (numbers, message) => {
    let delay = 2000; // Delay 2 detik
    numbers.forEach((number, index) => {
      setTimeout(() => {
          
          number = number.includes('@c.us') ? number : `${number}@c.us`;
          client.sendMessage(number, message).then(response => {
              // Pesan terkirim
              console.log(`Message sent to ${number}`);
          }).catch(err => {
              // Ada error saat mengirim, handle di sini
              console.error('Error sending message: ', err);
          });
      }, delay * index); // delay diperbanyak dengan index array
    });
  };

  const sendImages = (numbers, message, image) => {
    let delay = 2000; // Delay 2 detik
    numbers.forEach((number, index) => {
      setTimeout(() => {
          
          number = number.includes('@c.us') ? number : `${number}@c.us`;
                    
          client.sendMessage(number, image, {caption:message}).then(response => {
              // Pesan terkirim
              console.log(`Image sent to ${number}`);
          }).catch(err => {
              // Ada error saat mengirim, handle di sini
              console.error('Error sending image: ', err);
          });
          
      }, delay * index); // delay diperbanyak dengan index array
    });
  };

  client.on('message', message => {
      if(message.body == '!mulai') { // Ganti dengan trigger yang lo mau
          client.sendMessage(message.from, 'Selamat datang!');
      }
      // Tambahkan lebih banyak kondisi di sini untuk autoreply berbeda
  });

  client.initialize();

  // Handle exiting
  rl.on('close', () => {
    console.log('Exiting...');
    process.exit(0);
  });
};

main();





