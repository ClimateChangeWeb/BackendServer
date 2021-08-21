const mongoose = require('mongoose');
const { Schema } = mongoose;

//create the schema of discover
const discoverSchema = new Schema({
  title: { type: String, required: true }, //website title
  url: { type: String, required: true }, //website url
  date: Date, // website publish date
});

//create the model of discover
const Discover = mongoose.model('Discover', discoverSchema);

module.exports = Discover;
