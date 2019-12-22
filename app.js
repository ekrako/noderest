const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const secrets = require('./config/secret');

// const cors = require('cors');

const feedRoutes = require('./routes/feed');
const errorRoutes = require('./controllers/error');

const app = express();

app.use(bodyParser.json());
// app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});
app.use('/feed', feedRoutes);
app.use(errorRoutes.error404);
app.use(errorRoutes.error500);
mongoose
  .connect(secrets.mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(_result => {
    app.listen('8080', () => {
      console.log('server listen http://localhost:8080');
    });
  })
  .catch(err => {
    console.log(err);
  });