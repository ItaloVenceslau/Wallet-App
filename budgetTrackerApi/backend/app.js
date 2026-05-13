const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Budget Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}` 
  });
});

app.use(errorHandler);

module.exports = app;