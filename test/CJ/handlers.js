'use strict';

var kue = require('kue');
require('mock-kue');

var handlers = require('../../lib/cj/handlers');
var jobs;

describe('[CJ] Handlers', function () {
  before(function(done) {
    jobs = kue.createQueue();
    done();
  });

  describe('EnqueueAdvertisers Handler', function() {
    it.skip('should equeue the passed advertisers ids', function(done) {
      var jobData = {
        crawle: [1, 2, 4]
      };

      handlers.enqueueAdvertisers(jobData);
      kue.jobCount().should.eql(3);
      done();
    });
  });
});
