var mongoose = require('mongoose');
var projectTypesSchema = require('../schemas/projectType');

module.exports = mongoose.model('ProjectType', projectTypesSchema);