const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ad = require('../models/Ad');
const router = express.Router();


// Página de registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Processa o registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    await User.registerUser(username, password);
    res.redirect('/login');
  } catch (error) {
    res.send('Erro ao registrar o usuário: ' + error.message);
  }
});



// Página de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Processa o login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.isAuthenticated = true;
      req.session.user = user; // Salva o usuário na sessão
      return res.redirect('/dashboard'); // Redireciona para o dashboard
    } else {
      return res.redirect('/login'); // Volta ao login se falhar
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).send("Erro interno do servidor");
  }
});



// Middleware de autenticação
function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/login');
}



// Rota para exibir o dashboard do usuário (protegida por autenticação)
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Busca os anúncios do usuário autenticado
    const ads = await Ad.find({ userId: req.session.user._id });
    res.render('dashboard', { ads });
  } catch (error) {
    console.error('Erro ao carregar o dashboard:', error);
    res.status(500).send('Erro ao carregar o dashboard');
  }
});



// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Erro ao destruir a sessão:", err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); // Limpa o cookie da sessão
    res.redirect('/'); // Redireciona para a página inicial
  });
});

module.exports = router;
