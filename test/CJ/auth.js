'use strict';

var nock = require('nock');
var authHelper = require('../../lib/cj/auth');

describe('[CJ] Authenthication helper', function () {

  describe('Authentication request', function() {
    before(function(done) {
      nock('https://members.cj.com')
        .post('/member/foundation/memberlogin.do')
        .reply(200, 'Home publisher', {
          'set-cookie': [
            'jsContactId=3981910; domain=.cj.com; path=/',
            'jsCompanyId=4406512; domain=.cj.com; path=/'
          ]});

      done();
    });

    it('should store informations in the cookieJar', function(done) {
      authHelper.retrieveAuthInformations(function(err, userInfo) {
        userInfo.companyId.should.be.eql('4406512');
        done();
      });
    });

  });

  describe('Caching', function() {

    it('should cache the existing informations', function(done) {
      authHelper.retrieveAuthInformations(function(err, userInfo) {
        userInfo.companyId.should.be.eql('4406512');
        done();
      });
    });

  });
});
