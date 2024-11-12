const mongoose = require('mongoose');
const adSchema = new mongoose.Schema({
  name: String,
  description: String,
  city: String,
  photos: [{ type: String, required: true }],
});

module.exports = mongoose.model('Ad', adSchema);
