const CityModel = require('../models/city');
const CityJson = require('../data/city.list.json');
const mongoose = require('mongoose');
const cities = require('all-the-cities');
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
let count = 1;

setTimeout(() => {
  CityModel.collection.drop();
  CityJson.forEach((element) => {
    const result = cities.filter((city) =>
      city.name.match(new RegExp(element.name, 'i')),
    );
    let newCity = new CityModel({
      cityName: element.name,
      id: element.id,
    });
    //console.log(result);
    result.forEach((ci) => {
      //console.log('1');
      if (ci.cityId == element.id) {
        newCity.country = ci.country;
      }
    });

    count++;
    console.log(count);
    newCity.save((err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      } else {
        console.log(data);
      }
    });
  });
}, 5000);
