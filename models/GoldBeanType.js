var mongoose = require('mongoose');
var goldBeanTypeSchema = require('../schemas/goldBeanType');

module.exports = mongoose.model('GoldBeanType', goldBeanTypeSchema);