var mongoose = require('mongoose');
var projectsSchema = require('../schemas/project');

module.exports = mongoose.model('Project', projectsSchema);