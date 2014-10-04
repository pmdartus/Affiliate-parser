'use strict';

var _ = require('lodash');
var kue = require('kue');

var PLATFORMS = ['CJ'];

var Job = kue.Job;
var jobs = kue.createQueue();
var handlers = {};

var registerJobsAndHandlers = function () {
  PLATFORMS.forEach(function(platform) {
    var path = './' + platform;
    var p = require(path);

    handlers = _.merge(p.handlers, handlers);
  });
};

var dispatch = function(job) {
  var type = job.type;
  var res = job.result;

  if (handlers[type]) {
    handlers[type](res);
  } else {
    console.log(res);
  }
};

var loadDispatcher = function() {
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
    console.log('job-failed', id);
  });
};

module.exports.init = function(isWoker) {
  if (!isWoker) {
    return;
  }

  registerJobsAndHandlers();
  loadDispatcher();
};
