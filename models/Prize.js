const mongoose = require('mongoose')
const prizeSchema = require('../schemas/prize')

module.exports = mongoose.model('Prize', prizeSchema)