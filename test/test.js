const expect = require('chai').expect;
const axios = require('axios');

//test the api
describe('IBM AI api', function () {
  var url = 'https://ibm-ai.us-south.cf.appdomain.cloud/';
  it('returns status 200 to check if api works', function (done) {
    axios.get(url).then(function (response) {
      // handle success
      console.log(response.status);

      if (response.status === 200 && response.data === 'hello') {
        done();
      }
    });
  });
});
