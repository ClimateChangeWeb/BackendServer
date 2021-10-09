const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const axios = require('axios');
const DiscoverModel = require('./models/discover');
const CharityModel = require('./models/charity');
const fs = require('fs');
const path = require('path');
const rssUrls = require('./models/australiaWarningRss');
const CityWithCountry = require('./models/cityWithCountry');
const { parse } = require('rss-to-json');
const charityJson = require('./data/charities.json');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});
router.use(morgan('combined', { stream: accessLogStream }));
router.use(morgan('tiny'));
//we are defining a new parameter called host
morgan.token('host', function (req, res) {
  return req.hostname;
});

router.get('', function (req, res) {
  res.send('hello, this is the backend server');
});

//get the discover api url
const discoverUrl = 'https://ibm-ai.us-south.cf.appdomain.cloud/discover';
router.get('/discover', (req, res) => {
  if (req.query.password !== process.env.ADMIN_PASSWORD) {
    /**
     * because this is about drop and insert data into database
     * so it needs the auth method
     * it also can used like JWT token tho
     */
    console.log('Forbidden: You dot have the permission');
    return res
      .status(403)
      .json({ message: 'Forbidden: You dot have the permission' });
  }

  // result to store the data
  let result;
  //get request to get the data
  axios
    .get(discoverUrl)
    .then(function (response) {
      //store into result
      result = response.data.result.results;

      //reset the collection to avoid duplicate website
      DiscoverModel.collection.drop();

      //store into database
      result.forEach((element) => {
        let newDiscover = new DiscoverModel({
          title: element.title,
          url: element.url,
          date:
            typeof element.publication_date !== 'undefined'
              ? new Date(element.publication_date)
              : null,
        });

        //save
        newDiscover.save((err) => {
          if (err) {
            console.error(err);
            return res.status(500).send(err);
          }
        });
      });
      res.send('complete');
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

router.get('/warning', async (req, res) => {
  let results = []; // array to store the result
  let count = 0; // count the number of states
  let validURL; // store the valid url for insert into results
  let add = false;

  for await (const url of rssUrls) {
    await axios
      .get(url)
      .then(async function (response) {
        // The rss to json package cannot handling for empty xml
        // so I have to do it by myself
        count++;
        if (findWord('<item>', response.data)) {
          validURL = url;
          console.log('true');
          add = true;
        } else {
          console.log(url);
          console.log('false');
          add = false;
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });

    // if add is true then add the rss data to list
    if (add) {
      var rss = await parse(validURL);
      await results.push(rss);
      console.log(results[0].items[0]);
    }

    // if every get every data send to the client
    if (count === 7) {
      res.send(results);
      console.log(results);
    }
  }

  //await res.send(results);
});

const weatherAPIUrl = 'https://api.openweathermap.org/data/2.5/weather';
router.get('/weather', (req, res, next) => {
  const cityId = req.query.cityId;
  axios
    .get(
      weatherAPIUrl +
        `?id=${cityId}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
    )
    .then(async (response) => {
      const currentCountry = response.data.sys.country;
      // console.log(response.data);

      // find the city data
      const doc = await CityWithCountry.findOne({ id: cityId });
      console.log(doc);

      // if the country is null update with the api data from weather api
      if (await !doc.country) {
        console.log('No country in the current document');
        await doc.updateOne({ country: currentCountry });
      }
      await res.send(response.data);
    })
    .catch((err) => {
      // catch error
      console.log(err);
      return next(err);
    });
});

router.get('/charity', (req, res) => {
  if (req.query.password !== process.env.ADMIN_PASSWORD) {
    /**
     * because this is about drop and insert data into database
     * so it needs the auth method
     * it also can used like JWT token tho
     */
    console.log('Forbidden: You dot have the permission');
    return res
      .status(403)
      .json({ message: 'Forbidden: You dot have the permission' });
  }

  //drop the current data
  CharityModel.collection.drop();

  //go through the charities
  charityJson.forEach((element) => {
    let newCharity = new CharityModel({
      url: element.url,
      name: element.name,
      introduction: element.introduction,
      image: element.image,
    });

    //save
    newCharity.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
    });
  });

  res.json({
    message: 'Completed to insert charities information into database',
  });
});

//check if the rss sub
function findWord(word, str) {
  if (str.search(word) === -1) {
    return false;
  } else {
    return true;
  }
}

module.exports = router;
