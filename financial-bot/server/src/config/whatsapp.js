const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { NlpManager } = require('node-nlp');
const config = require('./config');
const path = require('path');

class WhatsAppBot {
  constructor() {
    this.client = null;
    this.nlpManager = null;
    this.isReady = false;
  }

  async initialize() {
    // Initialize WhatsApp client
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.whatsapp.sessionPath
      }),
      puppeteer: {
        headless: config.whatsapp.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      }
    });

    // Initialize NLP manager
    this.nlpManager = new NlpManager({
      languages: ['id'], // Indonesian language
      forceNER: true,
      modelFileName: path.join(config.whatsapp.sessionPath, 'nlp-model.nlp')
    });

    await this.setupNLP();
    await this.setupWhatsAppEvents();
  }

  async setupNLP() {
    // Add Indonesian language understanding
    // Transaction intents
    this.nlpManager.addDocument('id', 'catat pengeluaran *', 'transaction.expense');
    this.nlpManager.addDocument('id', 'saya menghabiskan * untuk *', 'transaction.expense');
    this.nlpManager.addDocument('id', 'bayar * sebesar *', 'transaction.expense');
    this.nlpManager.addDocument('id', 'catat pemasukan *', 'transaction.income');
    this.nlpManager.addDocument('id', 'terima uang * dari *', 'transaction.income');
    this.nlpManager.addDocument('id', 'dapat gaji *', 'transaction.income');

    // Budget intents
    this.nlpManager.addDocument('id', 'atur budget * untuk *', 'budget.set');
    this.nlpManager.addDocument('id', 'tentukan anggaran * untuk *', 'budget.set');
    this.nlpManager.addDocument('id', 'lihat budget', 'budget.view');
    this.nlpManager.addDocument('id', 'cek anggaran', 'budget.view');

    // Report intents
    this.nlpManager.addDocument('id', 'laporan keuangan', 'report.summary');
    this.nlpManager.addDocument('id', 'ringkasan transaksi', 'report.transactions');
    this.nlpManager.addDocument('id', 'analisis pengeluaran', 'report.analysis');

    // Help intents
    this.nlpManager.addDocument('id', 'bantuan', 'help');
    this.nlpManager.addDocument('id', 'cara pakai', 'help');
    this.nlpManager.addDocument('id', 'menu', 'help');

    // Train entities
    this.nlpManager.addNamedEntityText('amount', 'currency', ['id'], ['ribu', 'juta', 'rp', 'rupiah']);
    this.nlpManager.addNamedEntityText('category', 'expense', ['id'], ['makan', 'transport', 'belanja', 'tagihan']);
    this.nlpManager.addNamedEntityText('period', 'time', ['id'], ['hari ini', 'minggu ini', 'bulan ini', 'tahun ini']);

    // Train responses
    this.nlpManager.addAnswer('id', 'transaction.expense', 'Baik, saya akan mencatat pengeluaran Anda.');
    this.nlpManager.addAnswer('id', 'transaction.income', 'Baik, saya akan mencatat pemasukan Anda.');
    this.nlpManager.addAnswer('id', 'budget.set', 'Budget Anda telah diatur.');
    this.nlpManager.addAnswer('id', 'budget.view', 'Berikut adalah ringkasan budget Anda:');
    this.nlpManager.addAnswer('id', 'report.summary', 'Berikut adalah laporan keuangan Anda:');
    this.nlpManager.addAnswer('id', 'help', 'Berikut adalah panduan penggunaan bot:');

    // Train the model
    await this.nlpManager.train();
  }

  async setupWhatsAppEvents() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('QR Code received. Scan it with WhatsApp.');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('message', async (message) => {
      try {
        if (!message.body || message.fromMe) return;

        const response = await this.nlpManager.process('id', message.body);
        const intent = response.intent;
        const entities = response.entities;

        await this.handleMessage(message, intent, entities);
      } catch (error) {
        console.error('Error processing message:', error);
        message.reply('Maaf, terjadi kesalahan dalam memproses pesan Anda.');
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    // Initialize the client
    await this.client.initialize();
  }

  async handleMessage(message, intent, entities) {
    // Implementation will be added in message handlers
    console.log('Processing message:', { intent, entities });
  }

  async sendMessage(to, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    return this.client.sendMessage(to, message);
  }
}

// Create singleton instance
const whatsappBot = new WhatsAppBot();

module.exports = whatsappBot;
