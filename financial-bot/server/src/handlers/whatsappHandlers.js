const { Transaction, Budget, User, ActivationCode } = require('../config/database');
const { AppError } = require('../middleware/error');
const moment = require('moment');

class WhatsAppHandler {
  constructor() {
    this.commands = {
      transaction: {
        income: this.handleIncome.bind(this),
        expense: this.handleExpense.bind(this)
      },
      budget: {
        set: this.handleSetBudget.bind(this),
        view: this.handleViewBudget.bind(this)
      },
      report: {
        summary: this.handleSummaryReport.bind(this),
        transactions: this.handleTransactionReport.bind(this),
        analysis: this.handleAnalysisReport.bind(this)
      }
    };
  }

  async processMessage(message, intent, entities) {
    try {
      const user = await this.validateUser(message.from);
      if (!user) {
        return this.sendActivationInstructions(message);
      }

      if (intent && this.commands[intent.split('.')[0]]) {
        const [category, action] = intent.split('.');
        return await this.commands[category][action](message, entities, user);
      }

      return this.sendHelpMessage(message);
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return message.reply('Maaf, terjadi kesalahan dalam memproses pesan Anda.');
    }
  }

  async validateUser(phoneNumber) {
    const user = await User.findOne({
      'phoneNumbers.number': phoneNumber,
      'phoneNumbers.isActive': true
    });

    if (!user) return null;

    const activePhone = user.phoneNumbers.find(p => 
      p.number === phoneNumber && 
      p.isActive && 
      p.expiresAt > new Date()
    );

    return activePhone ? user : null;
  }

  // Transaction Handlers
  async handleIncome(message, entities, user) {
    try {
      const amount = this.extractAmount(entities);
      const category = this.extractCategory(entities) || 'Uncategorized';
      const description = this.extractDescription(message.body);

      const transaction = await Transaction.create({
        user: user._id,
        type: 'income',
        amount,
        category,
        description,
        source: 'whatsapp',
        date: new Date()
      });

      return message.reply(
        `✅ Pemasukan berhasil dicatat:\n` +
        `💰 Jumlah: Rp ${amount.toLocaleString()}\n` +
        `📁 Kategori: ${category}\n` +
        `📝 Deskripsi: ${description}`
      );
    } catch (error) {
      throw new AppError('Gagal mencatat pemasukan', 400);
    }
  }

  async handleExpense(message, entities, user) {
    try {
      const amount = this.extractAmount(entities);
      const category = this.extractCategory(entities) || 'Uncategorized';
      const description = this.extractDescription(message.body);

      const transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount,
        category,
        description,
        source: 'whatsapp',
        date: new Date()
      });

      // Check budget alerts
      const budget = await this.checkBudgetAlerts(user._id, category, amount);
      let alertMessage = '';
      
      if (budget && budget.alert) {
        alertMessage = `\n\n⚠️ ${budget.alert}`;
      }

      return message.reply(
        `✅ Pengeluaran berhasil dicatat:\n` +
        `💰 Jumlah: Rp ${amount.toLocaleString()}\n` +
        `📁 Kategori: ${category}\n` +
        `📝 Deskripsi: ${description}${alertMessage}`
      );
    } catch (error) {
      throw new AppError('Gagal mencatat pengeluaran', 400);
    }
  }

  // Budget Handlers
  async handleSetBudget(message, entities, user) {
    try {
      const amount = this.extractAmount(entities);
      const category = this.extractCategory(entities);
      const period = this.extractPeriod(entities) || 'monthly';

      if (!amount || !category) {
        return message.reply(
          '❌ Format tidak valid.\n' +
          'Contoh: "atur budget 1000000 untuk makan bulan ini"'
        );
      }

      const { startDate, endDate } = this.calculateBudgetDates(period);

      let budget = await Budget.findOne({
        user: user._id,
        period,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (!budget) {
        budget = await Budget.create({
          user: user._id,
          period,
          startDate,
          endDate,
          totalBudget: amount,
          categories: [{ category, amount }]
        });
      } else {
        const categoryIndex = budget.categories.findIndex(c => c.category === category);
        if (categoryIndex >= 0) {
          budget.categories[categoryIndex].amount = amount;
        } else {
          budget.categories.push({ category, amount });
        }
        await budget.save();
      }

      return message.reply(
        `✅ Budget berhasil diatur:\n` +
        `💰 Jumlah: Rp ${amount.toLocaleString()}\n` +
        `📁 Kategori: ${category}\n` +
        `📅 Periode: ${this.formatPeriod(period, startDate, endDate)}`
      );
    } catch (error) {
      throw new AppError('Gagal mengatur budget', 400);
    }
  }

  async handleViewBudget(message, entities, user) {
    try {
      const period = this.extractPeriod(entities) || 'monthly';
      const { startDate, endDate } = this.calculateBudgetDates(period);

      const budget = await Budget.findOne({
        user: user._id,
        period,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (!budget) {
        return message.reply('❌ Tidak ada budget yang diatur untuk periode ini.');
      }

      const status = budget.getStatus();
      let response = `📊 *Status Budget ${this.formatPeriod(period, startDate, endDate)}*\n\n`;
      
      response += `💰 Total Budget: Rp ${status.totalBudget.toLocaleString()}\n`;
      response += `💸 Total Pengeluaran: Rp ${status.totalSpent.toLocaleString()}\n`;
      response += `💵 Sisa Budget: Rp ${status.remainingBudget.toLocaleString()}\n`;
      response += `📈 Persentase Terpakai: ${Math.round(status.spentPercentage)}%\n\n`;
      
      response += `*Detail per Kategori:*\n`;
      status.categoryStatus.forEach(cat => {
        response += `\n📁 ${cat.category}\n`;
        response += `Budget: Rp ${cat.budgeted.toLocaleString()}\n`;
        response += `Terpakai: Rp ${cat.spent.toLocaleString()} (${Math.round(cat.spentPercentage)}%)\n`;
      });

      return message.reply(response);
    } catch (error) {
      throw new AppError('Gagal menampilkan budget', 400);
    }
  }

  // Report Handlers
  async handleSummaryReport(message, entities, user) {
    try {
      const period = this.extractPeriod(entities) || 'monthly';
      const { startDate, endDate } = this.calculateBudgetDates(period);

      const [incomeTotal, expenseTotal] = await Promise.all([
        Transaction.getTotal(user._id, 'income', startDate, endDate),
        Transaction.getTotal(user._id, 'expense', startDate, endDate)
      ]);

      const balance = incomeTotal - expenseTotal;
      
      let response = `📊 *Ringkasan Keuangan ${this.formatPeriod(period, startDate, endDate)}*\n\n`;
      response += `📈 Total Pemasukan: Rp ${incomeTotal.toLocaleString()}\n`;
      response += `📉 Total Pengeluaran: Rp ${expenseTotal.toLocaleString()}\n`;
      response += `💰 Saldo: Rp ${balance.toLocaleString()}\n`;

      return message.reply(response);
    } catch (error) {
      throw new AppError('Gagal menampilkan ringkasan', 400);
    }
  }

  // Helper Methods
  extractAmount(entities) {
    const amountEntity = entities.find(e => e.entity === 'amount');
    if (!amountEntity) return null;
    
    // Convert text amount to number
    let amount = amountEntity.resolution.value;
    if (typeof amount === 'string') {
      amount = amount.replace(/[^0-9]/g, '');
    }
    return parseFloat(amount);
  }

  extractCategory(entities) {
    const categoryEntity = entities.find(e => e.entity === 'category');
    return categoryEntity ? categoryEntity.resolution.value : null;
  }

  extractPeriod(entities) {
    const periodEntity = entities.find(e => e.entity === 'period');
    return periodEntity ? periodEntity.resolution.value : null;
  }

  extractDescription(text) {
    // Remove command words and extract description
    const descriptionMatch = text.match(/untuk\s+(.+)$/i);
    return descriptionMatch ? descriptionMatch[1].trim() : 'No description';
  }

  calculateBudgetDates(period) {
    const now = moment();
    let startDate, endDate;

    switch (period) {
      case 'daily':
        startDate = now.startOf('day');
        endDate = now.endOf('day');
        break;
      case 'weekly':
        startDate = now.startOf('week');
        endDate = now.endOf('week');
        break;
      case 'monthly':
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        break;
      case 'yearly':
        startDate = now.startOf('year');
        endDate = now.endOf('year');
        break;
      default:
        startDate = now.startOf('month');
        endDate = now.endOf('month');
    }

    return { startDate: startDate.toDate(), endDate: endDate.toDate() };
  }

  formatPeriod(period, startDate, endDate) {
    const start = moment(startDate).format('DD/MM/YYYY');
    const end = moment(endDate).format('DD/MM/YYYY');
    return `${period} (${start} - ${end})`;
  }

  async checkBudgetAlerts(userId, category, amount) {
    const budget = await Budget.findOne({
      user: userId,
      'categories.category': category,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!budget) return null;

    const categoryBudget = budget.categories.find(c => c.category === category);
    if (!categoryBudget) return null;

    await budget.updateCategorySpending(category, amount);
    const status = budget.getStatus();
    const catStatus = status.categoryStatus.find(c => c.category === category);

    if (catStatus.spentPercentage >= 90) {
      return { alert: `Pengeluaran untuk ${category} sudah mencapai ${Math.round(catStatus.spentPercentage)}% dari budget!` };
    }

    if (catStatus.spentPercentage >= 80) {
      return { alert: `Perhatian: Budget ${category} tersisa ${Math.round(100 - catStatus.spentPercentage)}%` };
    }

    return null;
  }

  async sendActivationInstructions(message) {
    return message.reply(
      '❌ Nomor Anda belum terdaftar atau sudah tidak aktif.\n\n' +
      'Untuk menggunakan layanan ini, silakan:\n' +
      '1. Dapatkan kode aktivasi dari admin\n' +
      '2. Kirim pesan dengan format:\n' +
      '/aktivasi <username> <kode_aktivasi>'
    );
  }

  async sendHelpMessage(message) {
    return message.reply(
      '🤖 *Panduan Penggunaan Bot*\n\n' +
      '*Mencatat Transaksi:*\n' +
      '• Pemasukan: "catat pemasukan 1000000 untuk gaji"\n' +
      '• Pengeluaran: "catat pengeluaran 50000 untuk makan"\n\n' +
      '*Mengatur Budget:*\n' +
      '• Set Budget: "atur budget 2000000 untuk makan bulan ini"\n' +
      '• Lihat Budget: "lihat budget"\n\n' +
      '*Melihat Laporan:*\n' +
      '• Ringkasan: "laporan keuangan"\n' +
      '• Transaksi: "riwayat transaksi"\n' +
      '• Analisis: "analisis pengeluaran"\n\n' +
      'Untuk bantuan lebih lanjut, hubungi admin.'
    );
  }
}

module.exports = new WhatsAppHandler();
