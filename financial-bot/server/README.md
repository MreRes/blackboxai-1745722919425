# WhatsApp Financial Management Bot

A comprehensive financial management system with WhatsApp bot integration and web dashboard. The system helps users track expenses, manage budgets, and analyze financial patterns through both WhatsApp and a web interface.

## Features

### WhatsApp Bot
- Natural Language Processing for understanding financial commands
- Transaction recording (income/expenses)
- Budget management
- Financial reports and analysis
- Multi-language support (focused on Bahasa Indonesia)
- Context-aware conversations

### Web Dashboard
- Real-time financial overview
- Detailed transaction management
- Budget planning and tracking
- Advanced financial reporting
- User profile management

### Admin Panel
- User management
- Activation code generation
- System monitoring
- Database backup/restore
- WhatsApp session management

## Technical Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **WhatsApp Integration**: whatsapp-web.js
- **NLP**: node-nlp
- **Authentication**: JWT
- **Security**: bcrypt, express-validator

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- WhatsApp account for bot

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd financial-bot/server
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Configure environment variables in .env:
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/financial-bot
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
WHATSAPP_SESSION_PATH=./whatsapp-session
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication Routes
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/activate - Activate phone number
- GET /api/v1/auth/me - Get current user

### Transaction Routes
- POST /api/v1/transactions - Create transaction
- GET /api/v1/transactions - Get transactions
- GET /api/v1/transactions/:id - Get single transaction
- PUT /api/v1/transactions/:id - Update transaction
- DELETE /api/v1/transactions/:id - Delete transaction

### Budget Routes
- POST /api/v1/budgets - Create budget
- GET /api/v1/budgets - Get all budgets
- GET /api/v1/budgets/current - Get current budget
- PUT /api/v1/budgets/:id - Update budget
- DELETE /api/v1/budgets/:id - Delete budget

### Report Routes
- GET /api/v1/reports/summary - Get financial summary
- GET /api/v1/reports/trends - Get financial trends
- GET /api/v1/reports/analysis - Get detailed analysis

### Admin Routes
- POST /api/v1/admin/users - Create user
- GET /api/v1/admin/users - Get all users
- POST /api/v1/admin/activation-codes - Generate activation code
- GET /api/v1/admin/stats - Get system statistics
- POST /api/v1/admin/backup - Create database backup
- POST /api/v1/admin/restore - Restore database

## WhatsApp Bot Commands

### Transaction Recording
```
catat pengeluaran 50000 untuk makan
catat pemasukan 1000000 untuk gaji
```

### Budget Management
```
atur budget 2000000 untuk makan bulan ini
lihat budget
```

### Reports
```
laporan keuangan
ringkasan transaksi
analisis pengeluaran
```

## Security Features

- JWT authentication
- Password hashing
- Input validation
- Rate limiting
- Session management
- Request sanitization
- Error handling
- Audit logging

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

### Database Backup
```bash
npm run backup
```

### Database Restore
```bash
npm run restore <backup-file>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or open an issue in the repository.
