var mongoose = require('mongoose');
var membersSchema = require('../schemas/member');

module.exports = mongoose.model('Member', membersSchema);