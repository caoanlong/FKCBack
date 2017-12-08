const mongoose = require('mongoose')
const memberPrizeSchema = require('../schemas/memberPrize')

module.exports = mongoose.model('MemberPrize', memberPrizeSchema)