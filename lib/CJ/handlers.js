'use strict';

var kue = require('kue');
var async = require('async');

var jobs = kue.createQueue();

module.exports.enqueueAdvertisers = function (jobData) {
  var AdvertiserIds = jobData.crawle;

  async.eachSeries(AdvertiserIds, function(id, cb) {
    var jobTitle = '[CJ] - Advertiser: ' + id;
    jobs.create('cj:retrive-advertiser-info', {
      title: jobTitle,
      id: id
    }).save(cb);
  }, function(err) {
    if (err) {
      console.error('Imposible to enqueue jobs');
    }
  });

};

module.exports.saveAdvertiser = function (jobData) {
  console.log(jobData);
};
