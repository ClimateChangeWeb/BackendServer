const mongoose = require('mongoose');
const { Schema } = mongoose;
const collectionName = 'CityWithCountry';

//create the schema of discover
const citySchema = new Schema({
  cityName: String,
  id: Number,
  country: String,
});

//create the model of discover
const CityWithCountry = mongoose.model(
  'CityWithCountry',
  citySchema,
  collectionName,
);

module.exports = CityWithCountry;
