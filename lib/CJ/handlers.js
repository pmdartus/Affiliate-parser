'use strict';

var kue = require('kue');
var async = require('async');

var mongoose =require('mongoose');
var RawExtract = mongoose.model('RawExtract');

var jobs = kue.createQueue();

module.exports.enqueueAdvertisers = function (jobData, cb) {
  var AdvertiserIds = jobData.crawle;

  async.mapSeries(AdvertiserIds, function(id, cb) {
    var jobTitle = '[CJ] - Advertiser: ' + id;
    var job = jobs.create('cj:retrive-advertiser-info', {
      title: jobTitle,
      id: id
    }).save(function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, job.id);
    });
  }, cb);

};

module.exports.saveAdvertiser = function (jobData) {
  RawExtract.findAndUpdate(
    jobData.full.advertiserId,
    'CJ',
    jobData,
    function(err) {
      if (err) {
        console.log('Impossible to insert' + JSON.stringify(jobData));
      }
    }
  );
};
