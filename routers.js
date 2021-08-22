const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const axios = require('axios');
const DiscoverModel = require('./models/discover');
var fs = require('fs');
var path = require('path');
const rssUrls = require('./models/australiaWarningRss');
const { parse } = require('rss-to-json');

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
router.get('/weatherForecast', (req, res) => {
  axios
    .get(weatherAPIUrl + `?q=Melbourne&appid=${process.env.WEATHER_API_KEY}`)
    .then((response) => {
      console.log(response);
      // return the weather forecast
      res.send(response.data);
    })
    .catch((err) => {
      // catch error
      console.log(err);
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
