'use strict';

var kue = require('kue');
var async = require('async');

var jobs = kue.createQueue();

module.exports.enqueueAdvertisers = function (jobData, cb) {
  async.series([

    function enqueueNextPage(cb) {
      if (!jobData.nextPage) {
        return cb();
      }

      var jobTitle = '[Zanox] - Advertisers List page: ' + jobData.nextPage;
      jobs.create('zanox:retrive-advertiser-page', {
        title: jobTitle,
        page: jobData.nextPage
      }).save(cb);
    },

    function enqueueAdvertisersList(cb) {
      async.mapSeries(jobData.advertisers, function(advertiser, cb) {
        var jobTitle = '[Zanox] - Advertiser: ' + advertiser.name;
        jobs.create('zanox:retrive-advertiser-info', {
          title: jobTitle,
          advertiser: advertiser
        }).save(cb);
      }, cb);
    }

  ], cb);
};
