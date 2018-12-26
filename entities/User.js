const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    minlength: 4,
  },
  email: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
