const mongoose = require('mongoose');
const adSchema = new mongoose.Schema({
  name: String,
  description: String,
  city: String,
  photos: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Referência ao usuário
});

module.exports = mongoose.model('Ad', adSchema);
