const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema do usuario
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

// função para registrar um usuario
userSchema.statics.registerUser = async function (username, password) {
  const hasgedPassword = await bcrypt.hash(password, 10);
  const user = new this({username, password: hashedPassword});
  return await user.save();
};

// função para autenticar um usuario
userSchema.statics.authenticateUser = async function(username, password) {
  const user = await this.findOne({ username });
  if(user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
