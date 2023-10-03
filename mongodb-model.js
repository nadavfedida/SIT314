// mongodb-model.js
const mongoose = require('mongoose');

const lightSchema = new mongoose.Schema({
    _id: Number,
    location: String,
    brightness: Number,
    status: String,
    time: Date
});

const Light = mongoose.model('Light', lightSchema);

module.exports = Light;