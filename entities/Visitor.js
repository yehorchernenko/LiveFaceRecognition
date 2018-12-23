const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

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

var Visitor = mongoose.model('Visitor', VisitorSchema);

module.exports = Visitor;
