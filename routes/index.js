const express = require('express');
const router = express.Router();
const adsRouter = require('./ads'); // Importa o router e cityColors do ads.js
const Ad = require('../models/Ad');

router.use('/ads', adsRouter); // Use o router

router.get('/', async (req, res) => {
  const ads = await Ad.find();
  res.render('index', { ads, cityColors: adsRouter.cityColors }); // Passa cityColors para o render
});

module.exports = router;
