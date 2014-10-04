'use strict';

/**
 *  Module dependences
 */

var kue = require('kue');
var mongoose = require('mongoose');
var express = require('express');

var config = require('./config');
var core = require('./lib/core');

/**
 *  Connect to databases
 */

mongoose.connect(config.mongoUrl);
kue.createQueue({
  prefix: 'jobs',
  redis: config.redis
});

/**
 *  Init crawler
 */

core.init();


/**
 *  Start webserver and expose `app`
 */

if (config.isServer || !config.isWorker) {
  var app = module.exports = express();
  app.use(kue.app);
  app.listen(config.port);
}
