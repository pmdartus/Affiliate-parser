'use strict';

var nock = require('nock');

var jobs = require('../../lib/cj/jobs');

var mockAuthRequest = function() {
  nock('https://members.cj.com')
    .post('/member/foundation/memberlogin.do')
    .reply(200, 'Home publisher', {
      'set-cookie': [
        'jsContactId=3981910; domain=.cj.com; path=/',
        'jsCompanyId=4406512; domain=.cj.com; path=/'
      ]});
};

describe('[CJ] Jobs', function () {

  beforeEach(function(done) {
    mockAuthRequest();
    done();
  });

  it('should return all the advertisers', function(done) {
    var res = {
      "advertisers":[
        {"advertiserId":3022407,"advertiserStatus":null,"advertiserName":"foo","advertiserUrl":"http://www.foo.com"},
        {"advertiserId":3812192,"advertiserStatus":null,"advertiserName":"bar","advertiserUrl":"http://www.bar.net"},
      ]
    };

    nock('https://members.cj.com')
      .get('/member/publisher/4406512/advertisers.json')
      .reply(200, res);

    jobs.retriveAllAdvertisers(function(err, res) {
      res.advertisers.should.have.a.lengthOf(2);
      done(err);
    });
  });

  it('should return informations from a single advertiser', function(done) {
    nock('https://members.cj.com')
      .get('/member/publisher/4406512/advertiserSearch.json?advertiserIds=1')
      .reply(200, {
        totalResults: 1,
        advertisers: [
          {
            name: 'foobar',
            programTerms: [{ id: 1 }, { id: 2 }]
          }
        ]
      })
      .get('/member/publisher/4406512/programterms/1.json')
      .reply(200, {
        name: 'Premium plan'
      })
      .get('/member/publisher/4406512/programterms/2.json')
      .reply(200, {
        name: 'Basic plan'
      });

    jobs.retrieveAdvertiserInfo(1, function(err, res) {
      res.should.have.property('name', 'foobar');
      res.should.have.property('programTerms');

      res.programTerms.should.have.a.lengthOf(2);
      res.programTerms.should.containEql({name: 'Basic plan'});
      res.programTerms.should.containEql({name: 'Premium plan'});

      done(err);
    });
  });

  it('should return an error if several advertisers has been found', function(done) {
    nock('https://members.cj.com')
      .get('/member/publisher/4406512/advertiserSearch.json?advertiserIds=1')
      .reply(200, {
        totalResults: 0,
        advertisers: []
      });

    jobs.retrieveAdvertiserInfo(1, function(err) {
      err.should.be.ok;
      done();
    });
  });
});
