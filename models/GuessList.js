var mongoose = require('mongoose');
var guessListsSchema = require('../schemas/guessList');

module.exports = mongoose.model('GuessList', guessListsSchema);