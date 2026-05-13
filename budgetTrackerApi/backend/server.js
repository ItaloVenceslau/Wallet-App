const app = require('./app');
const connectDB = require('./src/config/database');

// A conexão com MongoDB já importa .env, então não precisa repetir dotenv aqui
const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar tudo
startServer();