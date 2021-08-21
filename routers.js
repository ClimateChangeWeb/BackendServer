const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const axios = require('axios');
const DiscoverModel = require('./models/discover');
var fs = require('fs');
var path = require('path');

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

module.exports = router;
