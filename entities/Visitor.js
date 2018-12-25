const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const _ = require('lodash');

var VisitorSchema = new mongoose.Schema({
  user: {
    _id: {type: ObjectId, ref: 'User'},
    email: {type: String, ref: 'User'},
    displayName: {type: String, ref: 'User'}
  },
  presentTime: {type: Number, default: 0},
  visitedAt: {type: Date, default: Date.now},
  isPresent: {type: Boolean, default: true}
});

VisitorSchema.methods.toJSON = function () {
  var visitor = this;
  var visitorObject = visitor.toObject();

  var presentTime = visitorObject.isPresent ? (new Date()) - visitorObject.visitedAt + visitor.presentTime : visitor.presentTime;
  return {
    name: visitorObject.user.displayName,
    email: visitorObject.user.email,
    presentTime: presentTime,
    isPresent: visitorObject.isPresent,
    lastVisit: visitorObject.visitedAt
  }
};

var Visitor = mongoose.model('Visitor', VisitorSchema);

module.exports = Visitor;
