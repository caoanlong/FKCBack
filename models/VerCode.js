var mongoose = require('mongoose');
var verCodesSchema = require('../schemas/verCode');

module.exports = mongoose.model('VerCode', verCodesSchema);