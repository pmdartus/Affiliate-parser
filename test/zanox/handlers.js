'use strict';

var request = require('supertest');
var async = require('async');

var app = require('../../index.js');
var handlers = require('../../lib/zanox/handlers');
var dbHelper = require('../helpers/db');

describe('[Zanox] Handlers', function () {

  beforeEach(function(done) {
    dbHelper.flushRedis(done);
  });

  describe('EnqueueAdvertisers Handler', function() {
    it('should equeue the passed advertisers and nextPage', function(done) {
      var jobData = {
        advertisers: [{ name: 'Foobar', id: 123 }],
        nextPage: 2
      };

      async.waterfall([
        function InsertJobs(cb) {
          handlers.enqueueAdvertisers(jobData, cb);
        },
        function retrieveAllJobs(jobIds, cb) {
          jobIds.nextPage.should.be.ok;
          jobIds.advertisersList.should.have.a.lengthOf(1);

          request(app).get('/stats').end(cb);
        },
        function retrieveSingleJob(res, cb) {
          res.body.inactiveCount.should.be.eql(2);
          cb();
        }
      ], done);
    });

    it('should ignore nextPage if none', function(done) {
      var jobData = {
        advertisers: [{ name: 'Foobar', id: 123 }]
      };

      async.waterfall([
        function InsertJobs(cb) {
          handlers.enqueueAdvertisers(jobData, cb);
        },
        function retrieveAllJobs(jobIds, cb) {
          (jobIds.nextPage === undefined).should.be.true;
          jobIds.advertisersList.should.have.a.lengthOf(1);

          request(app).get('/stats').end(cb);
        },
        function retrieveSingleJob(res, cb) {
          res.body.inactiveCount.should.be.eql(1);
          cb();
        }
      ], done);
    });
  });
});
