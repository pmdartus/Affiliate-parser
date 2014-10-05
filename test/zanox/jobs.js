'use strict';

var nock = require('nock');

var jobs = require('../../lib/zanox/jobs');
var testAuthHelper = require('./auth');

describe('[Zanox] Jobs', function () {
  beforeEach(function(done) {
    testAuthHelper.mockAuthRequest();
    done();
  });

  it.only('should return the selected advertiser page', function(done) {
    nock('https://marketplace.zanox.com')
      .post('/zanox/affiliate/1156722/merchant-directory/xhr-directory/pageNumber/1/pageLength/100')
      .replyWithFile(200, __dirname + '/files/listPage.html');

    jobs.retriveAdvertisersPage(1, function(err, res) {
      if (err) {
        done(err);
      }

      res.advertisers.should.have.a.lengthOf(2);
      res.nextPage.should.have.be.eql(2);
      done();
    });
  });
});
