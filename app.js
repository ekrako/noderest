const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const secrets = require('./config/secret');
// const isAuth = require('./middleware/is-auth');

const path = require('path');

const cors = require('cors');

// const feedRoutes = require('./routes/feed');
// const authRoutes = require('./routes/auth');
// const statusRoutes = require('./routes/status');
const errorRoutes = require('./controllers/error');

const multer = require('multer');
const uuidv4 = require('uuid/v4');
const graphqlHttp = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  cb(
    null,
    file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
  );
};

app.use(multer({ storage, fileFilter }).single('image'));

app.use(cors());
app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'Error occured';
      const statusCode = err.originalError.statusCode || 500;
      return { message, status: statusCode, data };
    }
  })
);
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   next();
// });
// app.use('/feed', isAuth, feedRoutes);
// app.use('/auth', authRoutes);
// app.use(isAuth, statusRoutes);
app.use(errorRoutes.error404);
app.use(errorRoutes.errorHandler);

mongoose
  .connect(secrets.mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(_result => {
    app.listen('8080', () => {
      console.log('server listen http://localhost:8080');
    });
  })
  .catch(err => {
    console.log(err);
  });
