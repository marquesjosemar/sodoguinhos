const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

//banco de dados
mongoose.connect('mongodb://localhost:27017/sodoguinhos')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

//
app.set('view engine', 'ejs');
// Define o diretório 'public' como pasta estática
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const indexRoutes = require('./routes/index');
const adsRoutes = require('./routes/ads');
app.use('/', indexRoutes);
app.use('/ads', adsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
