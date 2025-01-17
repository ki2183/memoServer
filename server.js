  require('dotenv').config();
  const cors = require('cors');
  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  const { createProxyMiddleware } = require('http-proxy-middleware');

  const app = express();

  const port = process.env.PORT || 4500;

  const corsOptions = [
    {
        origin: process.env.serverURL,
        credentials: true,
        optionsSuccessStatus: 200
    }
];

app.use(cors(corsOptions));

  // Static File Service

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Node의 native Promise 사용
  mongoose.Promise = global.Promise;

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

  // ROUTERS
  app.use('/memos', require('./routes/memos'));

  app.listen(port, () => console.log(`Server listening on port ${port}`));