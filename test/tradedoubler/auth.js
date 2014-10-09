'use strict';

var nock = require('nock');
var authHelper = require('../../lib/tradedoubler/auth');

var mockAuthRequest = module.exports.mockAuthRequest = function() {
  nock('http://login.tradedoubler.com')
    .matchHeader('User-Agent', /Mozilla\/.*/)
    .post('/pan/login')
    .reply(200, 'Login Page')
    .get('/pan/aProgramList.action')
    .replyWithFile(200, __dirname + '/files/programList.html');
};

describe('[Zanox] Authenthication helper', function () {
  before(function(done) {
    mockAuthRequest();
    done();
  });

  it('should store informations users informations', function(done) {
    authHelper.retrieveAuthInformations(function(err, userInfo) {
      if (err) {
        return done(err);
      }

      userInfo.should.have.property('siteIds');
      userInfo.siteIds.should.have.a.lengthOf(2);

      done();
    });
  });
});
