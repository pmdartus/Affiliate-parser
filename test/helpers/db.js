'use strict';

var kue = require('kue');
var jobs = kue.createQueue();

module.exports.flushRedis = function(cb) {
  jobs.client.flushdb(cb);
};
