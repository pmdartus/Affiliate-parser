'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');

var nodeEnv = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

var mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/affiliate-parser-' + nodeEnv;

var redisConfig;
if (nodeEnv !== 'production') {
  redisConfig = {
    port: '6379',
    host: 'localhost'
  };
} else {
  var redisURL = url.parse(process.env.REDIS_URL);
  redisConfig = {
    port: redisURL.port,
    host: redisURL.hostname,
    auth: redisURL.auth.split(":")[1]
  };
}

var creds;
var credentialsPath = path.normalize(__dirname + '/../keys.json');
if (fs.existsSync(credentialsPath)) {
  creds = require('../keys.json');
} else {
  console.error('Impossible to retrieve file keys.json');
  process.exit(1);
}

module.exports = {
  env: nodeEnv,
  port: port,

  mongoUrl: mongoUrl,
  redis: redisConfig,

  creds: creds
};
