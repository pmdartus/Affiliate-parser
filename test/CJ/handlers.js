'use strict';

var request = require('supertest');
var async = require('async');

var app = require('../../index.js');
var handlers = require('../../lib/cj/handlers');
var dbHelper = require('../helpers/db');

describe('[CJ] Handlers', function () {

  beforeEach(function(done) {
    dbHelper.flushRedis(done);
  });

  describe('EnqueueAdvertisers Handler', function() {
    it('should equeue the passed advertisers ids', function(done) {
      var jobData = {
        crawle: [24, 42, 88]
      };

      async.waterfall([
        function InsertJobs(cb) {
          handlers.enqueueAdvertisers(jobData, cb);
        },
        function retrieveAllJobs(jobIds, cb) {
          request(app).get('/stats').end(cb);
        },
        function retrieveSingleJob(res, cb) {
          res.body.inactiveCount.should.be.eql(3);
          cb();
        }
      ], done);
    });

    it('should set the right name', function(done) {
      var jobData = {
        crawle: [1]
      };

      async.waterfall([
        function InsertJobs(cb) {
          handlers.enqueueAdvertisers(jobData, cb);
        },
        function retrieveSingleJob(ids, cb) {
          request(app).get('/job/' + ids[0]).end(cb);
        },
        function checkTitleAndType(res, cb) {
          res.body.type.should.be.eql('cj:retrive-advertiser-info');
          res.body.data.title.should.containEql('[CJ] - Advertiser');
          res.body.data.id.should.be.eql(1);

          cb();
        }
      ], done);

    });
  });
});
