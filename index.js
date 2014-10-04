'use strict';

var kue = require('kue');
var mongoose = require('mongoose');

var config = require('./config');

mongoose.connect(config.mongoUrl);
kue.createQueue({
  prefix: 'jobs',
  redis: config.redis
});

// Start web server for monitoring
kue.app.listen(config.port);
