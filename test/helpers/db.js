'use strict';

var kue = require('kue');
var mochaMongoose = require('mocha-mongoose');

var config = require('../../config');

module.exports.emptyMongo =  function() {
  mochaMongoose(config.mongoUrl, {noClear: true});
};

module.exports.flushRedis = function(cb) {
  var jobs = kue.createQueue();
  jobs.client.flushdb(cb);
};
