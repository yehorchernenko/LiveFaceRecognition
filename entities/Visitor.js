const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const _ = require('lodash');

var VisitorSchema = new mongoose.Schema({
  user: {
    _id: {type: ObjectId, ref: 'User'},
    email: {type: String, ref: 'User'},
    displayName: {type: String, ref: 'User'}
  },
  isPresent: {type: Boolean, default: true},
  history: [
    {
      enteredAt: {type: Date, default: Date.now},
      exitedAt: {type: Date, default: null},
    }
  ]
});

VisitorSchema.methods.toJSON = function () {
  let visitor = this;
  let visitorObject = visitor.toObject();

  return {
    name: visitorObject.user.displayName,
    email: visitorObject.user.email,
    isPresent: visitorObject.isPresent,
    history: visitorObject.history,
  }
};

var Visitor = mongoose.model('Visitor', VisitorSchema);

module.exports = Visitor;
