'use strict';

var async = require('async');
var kue = require('kue');

var cjJobs = require('./jobs');
var cjHandler = require('./handlers');

// Register jobs
var jobs = kue.createQueue();

module.exports = {
  startJob: 'cj:retrive-all-advertisers',
  handlers: {
    'cj:retrive-all-advertisers': cjHandler.enqueueAdvertisers,
    'cj:retrive-advertiser-info': cjHandler.saveAdvertiser
  }
};

module.exports.registerJobs = function() {
  jobs.process('cj:retrive-all-advertisers', function(job, done){
    async.waterfall([
      function(cb) {
        cjJobs.retriveAllAdvertisers(cb);
      },
      function(data, cb) {
        var ids = data.advertisers.map(function(advertiser) {
          return advertiser.advertiserId;
        });

        cb(null, {
          crawle: ids
        });
      }
    ], done);
  });

  jobs.process('cj:retrive-advertiser-info', 2, function(job, done){
    cjJobs.retrieveAdvertiserInfo(job.data.id, done);
  });
};
