'use strict';

var kue = require('kue');

var zanoxJobs = require('./jobs');
var zanoxHandlers = require('./handlers');

// Register jobs
var jobs = kue.createQueue();

module.exports = {
  startJob: 'zanox:retrive-first-advertiser-page',
  handlers: {
    'zanox:retrive-first-advertiser-page': zanoxHandlers.enqueueAdvertisers,
    'zanox:retrive-advertiser-page': zanoxHandlers.enqueueAdvertisers,
    'zanox:retrive-advertiser-info': zanoxHandlers.saveAdvertiser,
  }
};

module.exports.registerJobs = function() {
  jobs.process('zanox:retrive-first-advertiser-page', function(job, done){
    zanoxJobs.retriveAdvertisersPage(1, done);
  });

  jobs.process('zanox:retrive-advertiser-page', function(job, done){
    zanoxJobs.retriveAdvertisersPage(job.data.page, done);
  });

  jobs.process('zanox:retrive-advertiser-info', function(job, done){
    zanoxJobs.retrieveAdvertiserInfo(job.data, done);
  });
};
