const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();



// Página de registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Processa o registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcryptjs.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
   return res.redirect('/login');
  } catch (error) {
   return res.redirect('/register'); // Redireciona em caso de erro (como nome de usuário já existente)
  }
});

// Página de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Processa o login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Dados recebidos do formulário:", username, password);

  const user = await User.findOne({ username });
  console.log("Usuário encontrado no banco de dados:", user);

  if (user && await bcryptjs.compare(password, user.password)) {
    console.log("Usuário autenticado com sucesso");
    req.session.isAuthenticated = true;
    console.log("Sessão após autenticação:", req.session);
   return res.redirect('/ads/new');  // Redireciona para a página de anúncio
  } else {
    console.log("Falha na autenticação: usuário não encontrado ou senha incorreta");
    return res.redirect('/login');  // Redireciona em caso de falha no login
  }

  req.session.isAuthenticated = true; // Define o usuário como autenticado
   return res.redirect('/ads/new'); // Redireciona para o formulário de novo anúncio
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
