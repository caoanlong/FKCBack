var mongoose = require('mongoose');
var temporaryOrderSchema = require('../schemas/temporaryOrder');

module.exports = mongoose.model('TemporaryOrder', temporaryOrderSchema);