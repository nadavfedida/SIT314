
const mongoose = require('mongoose');

module.exports = mongoose.model('Light', new mongoose.Schema({
    _id: Number,
    location: String,
    brightness: Number,
    status: String,
    time: Date
}));


