const axios = require('axios');
const fs = require('fs');
const discoverUrl = 'https://ibm-ai.us-south.cf.appdomain.cloud/discover';

// send to the ai server to get the relevant new about climate changes
axios
  .get(discoverUrl)
  .then(function (response) {
    // handle success
    console.log(response.data.result.results[0].text);

    //for showcase purpose just save in file will change to dynamic later
    //saveToFile(JSON.stringify(response.data.result));
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

/**
 *
 * @param {*} data
 */
//now is only for MVP showcase so only an example
const saveToFile = (data) => {
  fs.appendFile('discoverData.json', data, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
};
