'use strict';

var request = require('request');
var async = require('async');

var config = require('../../config');
var handlers = require('../../lib/cj/handlers');

describe('[CJ] Handlers', function () {

  describe('EnqueueAdvertisers Handler', function() {
    it('should equeue the passed advertisers ids', function(done) {
      var jobData = {
        crawle: [24, 42, 88]
      };

      var ids;
      async.waterfall([
        function InsertJobs(cb) {
          handlers.enqueueAdvertisers(jobData, cb);
        },
        function retrieveAllJobs(jobIds, cb) {
          ids = jobIds;
          var statsUrl = 'http://localhost:' + config.port + '/stats';
          request.get(statsUrl, cb);
        },
        function retrieveSingleJob(res, stats, cb) {
          stats = JSON.parse(stats);
          stats.inactiveCount.should.be.eql(3);

          var jobUrl = 'http://localhost:' + config.port + '/job/' + ids[1];
          request.get(jobUrl, cb);
        },
        function checkTitleAndType(res, jobInfo, cb) {
          jobInfo = JSON.parse(jobInfo);

          jobInfo.type.should.be.eql('cj:retrive-advertiser-info');
          jobInfo.data.title.should.containEql('[CJ] - Advertiser');
          jobInfo.data.id.should.be.eql(42);

          cb();
        }
      ], done);
    });
  });
});
