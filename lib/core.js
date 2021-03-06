'use strict';

/**
 * Module dependences
 */

var _ = require('lodash');
var kue = require('kue');
var config = require('../config');

require('./models/raw-extract');

/**
 * Constant containing available platforms.
 */

var PLATFORMS = module.exports.platform = ['cj', 'zanox'];

var Job = kue.Job;
var jobs = kue.createQueue();
var handlers = {};

/**
 * Load all avaible jobs and register them.
 */

var registerJobs = function () {
  PLATFORMS.forEach(function(platform) {
    var path = './' + platform;
    require(path).registerJobs();
  });
};

/**
 * Invoke the right handler OR display the result on the stdout.
 *
 * @params {Job} job
 */

var dispatch = function(job) {
  var type = job.type;
  var res = job.result;

  if (handlers[type]) {
    handlers[type](res);
  } else {
    console.log(res);
  }
};

/**
 * Register available handlers and listen to completion or failure events.
 */

var registerHandlers = function() {
  PLATFORMS.forEach(function(platform) {
    var path = './' + platform;
    handlers = _.merge(require(path).handlers, handlers);
  });

  jobs.on('job complete', function (id) {
    Job.get(id, function(err, job) {
      if(err) {
        console.log('Failed to retrieve the job: ', id);
        return;
      }
      dispatch(job);
      job.remove();
    });
  }).on('job failed', function(id) {
    Job.get(id, function(err, job) {
      if(err) {
        console.log('Failed to retrieve the job: ', id);
        return;
      }
      console.log('Job #' + id + ' failed');
      console.log(job);
    });
  });
};

/**
 * Initialize the server in the right state and expose `init`.
 *
 * @api public
 */

module.exports.init = function() {
  if (!config.isWoker) {
    registerHandlers();
  }

  if (!config.isServer && config.env !== 'test') {
    registerJobs();
  }
};
