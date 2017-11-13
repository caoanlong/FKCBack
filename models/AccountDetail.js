var mongoose = require('mongoose');
var accountDetailSchema = require('../schemas/accountDetail');

module.exports = mongoose.model('AccountDetail', accountDetailSchema);