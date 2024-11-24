const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const authRoutes = require('./routes/auth');
const crypto = require('crypto');


//banco de dados
mongoose.connect('mongodb://localhost:27017/sodoguinhos')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));



//
app.set('view engine', 'ejs');
// Define o diretório 'public' como pasta estática
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));



//gerenciando sessões de usuarios
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hora
}));



// Middleware para analisar o corpo das requisições 
app.use(express.json());



// Importação das rotas
const indexRoutes = require('./routes/index');
const adsRoutes = require('./routes/ads');
app.use('/', authRoutes); //rota de autenticação primeiro de todas
app.use('/', indexRoutes);
app.use('/ads', adsRoutes);
app.use('/auth', authRoutes);





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
