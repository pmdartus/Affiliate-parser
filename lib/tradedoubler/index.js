'use strict';

var kue = require('kue');

var tradedoublerJobs = require('./jobs');

// Register jobs
var jobs = kue.createQueue();

module.exports.registerJobs = function() {
  jobs.process('tradeboudler:retrive-all-advertisers', function(job, done){
    tradedoublerJobs.retriveAllAdvertisers(done);
  });
};
