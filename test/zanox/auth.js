'use strict';

var nock = require('nock');
var authHelper = require('../../lib/zanox/auth');

var configJSON = module.exports.configJSON = {
  adspace: {
    id: 1193212
  },
  userid: 1156722
};

var mockAuthRequest = module.exports.mockAuthRequest = function() {
  var ret = '<script type="text/javascript">' + JSON.stringify(configJSON) + '</script>';

  nock('https://auth.zanox.com')
    .filteringPath(/loginForm.userName=[^&]*&loginForm.password=.*/g, 'loginForm.userName=XXX&loginForm.password=XXX')
    .post('/connect/login?loginForm.userName=XXX&loginForm.password=XXX')
    .reply(200, ret);
};

describe('[Zanox] Authenthication helper', function () {
  before(function(done) {
    mockAuthRequest();
    done();
  });

  it('should store informations users informations', function(done) {
    authHelper.retrieveAuthInformations(function(err, cookieJar, userInfo) {
      if (err) {
        return done(err);
      }

      userInfo.publisherId.should.be.eql(configJSON.userid);
      userInfo.adSpaceId.should.be.eql(configJSON.adspace.id);
      done();
    });
  });
});
