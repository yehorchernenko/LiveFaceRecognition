const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    minlength: 4,
  },
  images: [
    {type: String}
  ],
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

UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();

  return {
    displayName: userObject.displayName,
    email: userObject.email,
    images: userObject.images,
    password: userObject.password,
  }
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
