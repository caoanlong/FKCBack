var mongoose = require('mongoose');
var guessListsSchema = require('../schemas/guessList');

// guessListsSchema.pre('find', function(next) {
// 	this.populate('project');
// 	next()
// })

module.exports = mongoose.model('GuessList', guessListsSchema);