'use strict';

var kue = require('kue');
var async = require('async');

var mongoose =require('mongoose');
var RawExtract = mongoose.model('RawExtract');

var jobs = kue.createQueue();

module.exports.enqueueAdvertisers = function (jobData, cb) {
  async.parallel({
    nextPage: function (cb) {
      if (!jobData.nextPage) {
        return cb();
      }

      var jobTitle = '[Zanox] - Advertisers List page: ' + jobData.nextPage;
      var job = jobs.create('zanox:retrive-advertiser-page', {
        title: jobTitle,
        page: jobData.nextPage
      }).save(function(err) {
        if (err) {
          return cb(err);
        }

        cb(null, job.id);
      });
    },

    advertisersList: function (cb) {
      async.mapSeries(jobData.advertisers, function(advertiser, cb) {
        var jobTitle = '[Zanox] - Advertiser: ' + advertiser.name;
        var job = jobs.create('zanox:retrive-advertiser-info', {
          title: jobTitle,
          advertiser: advertiser
        }).save(function(err) {
          if (err) {
            return cb(err);
          }

          cb(null, job.id);
        });
      }, cb);
    }

  }, cb);
};


module.exports.saveAdvertiser = function (jobData) {
  RawExtract.findAndUpdate(
    jobData.id,
    'Zanox',
    jobData,
    function(err) {
      if (err) {
        console.log('Impossible to insert' + JSON.stringify(jobData));
      }

      console.log(jobData);
    }
  );
};
