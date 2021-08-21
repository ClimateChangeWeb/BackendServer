const mongoose = require('mongoose');
const { Schema } = mongoose;

//create the schema of discover
const citySchema = new Schema({
  cityName: String,
  id: Number,
});

//create the model of discover
const City = mongoose.model('City', citySchema);

module.exports = City;
