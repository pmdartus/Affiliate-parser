'use strict';

var nock = require('nock');
var authHelper = require('../../lib/zanox/auth');

describe('[CJ] Authenthication helper', function () {

  describe('Authentication request', function() {
    var configJSON;

    before(function(done) {
      configJSON = {
        adspace: {
          id: 1234
        },
        userid: 1156722
      };
      var ret = '<script type="text/javascript">' + JSON.stringify(configJSON) + '</script>';

      nock('https://auth.zanox.com')
        .filteringPath(/loginForm.userName=[^&]*&loginForm.password=.*/g, 'loginForm.userName=XXX&loginForm.password=XXX')
        .post('/connect/login?loginForm.userName=XXX&loginForm.password=XXX')
        .reply(200, ret);

      done();
    });

    it('should store informations in the cookieJar', function(done) {
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
});
