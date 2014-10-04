'use strict';

var kue = require('kue');
var mongoose = require('mongoose');
var express = require('express');

var config = require('./config');

mongoose.connect(config.mongoUrl);
kue.createQueue({
  prefix: 'jobs',
  redis: config.redis
});

// Start web server for monitoring
var app = module.exports = express();
app.use(kue.app);
app.listen(config.port);
