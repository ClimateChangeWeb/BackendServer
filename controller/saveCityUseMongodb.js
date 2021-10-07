const mongodb = require('mongodb');
const CityJson = require('../data/city.list.json');
const cities = require('all-the-cities');
require('dotenv').config();
// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGODB_URI;
const client = new mongodb.MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('Sitboard');
    const cityCollection = database.collection('CityWithCountry');

    for await (element of CityJson) {
      const doc = {
        cityName: element.name,
        id: element.id,
        country: await searchCountry(element),
      };

      //give a two second timeout

      console.log(doc);
      const result = await cityCollection.insertOne(doc);
      //console.log(`A document was inserted with the _id: ${result.insertedId}`);
      console.log(result);
    }

    // create a document to insert
  } finally {
    await client.close();
  }
}

const searchCountry = async (doc) => {
  const cityWithIDs = cities.filter((city) =>
    city.name.match(new RegExp(doc.name, 'i')),
  );
  console.log(cityWithIDs);

  for await (cityWithIdsElement of cityWithIDs) {
    console.log('1');
    if (
      await (cityWithIdsElement.cityId == doc.id ||
        Math.abs(cityWithIdsElement.cityId - doc.id) < 10) // some id would be slightly different between 2 database
    ) {
      console.log(cityWithIdsElement.country);
      return cityWithIdsElement.country;
    }
  }
};
run().catch(console.dir);
