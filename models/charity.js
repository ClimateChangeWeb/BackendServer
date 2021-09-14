const mongoose = require('mongoose');
const { Schema } = mongoose;

//create the schema of a charity
const charitySchema = new Schema({
  name: String,
  url: String,
  image: String,
  introduction: String,
});

//create the model of the charity
const Charity = mongoose.model('Charity', charitySchema);

module.exports = Charity;
