const CityModel = require('../models/city');
const CityJson = require('../data/city.list.json');
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

//connect to database
db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', function () {
  // we're connected!
  console.log('database connected');
});

setTimeout(() => {
  CityJson.forEach((element) => {
    let newCity = new CityModel({
      cityName: element.name,
      id: element.id,
    });
    newCity.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
    });
  });
}, 10000);
