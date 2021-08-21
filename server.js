const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routers');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

//connect to database
db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', function () {
  // we're connected!
  console.log('database connected');
});

//get routes
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server start at PORT ${PORT}`);
});
