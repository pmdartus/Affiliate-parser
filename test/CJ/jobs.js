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
      if (err) {
        done(err);
      }

      res.advertisers.should.have.a.lengthOf(2);
      done();
    });
  });

  it('should return informations from a single advertiser', function(done) {
    nock('https://members.cj.com')
      .get('/member/advertiser/1/detail.json')
      .reply(200, {advertiser: {organization: 'Foobar', programmUrl: 'A simple programm'}} )
      .get('/member/api/publisher/4406512/merchant/1/commissionsByCountry')
      .reply(200, {countryMetrics:[{countryCode: 'FR'}] })
      .get('/member/publisher/4406512/advertiser/1/activeProgramTerms.json')
      .reply(200, {activeProgramTerms: 'none'})
      .get('/member/advertiser/1/contact/4406512.json')
      .reply(200, {contact: {}})
      .get('/member/publisher/4406512/advertiserSearch.json?keywords=Foobar')
      .reply(200, {advertisers: []});

    jobs.retrieveAdvertiserInfo(1, function(err, res) {
      if (err) {
        return done(err);
      }

      res.should.have.property('details');
      res.should.have.property('comissionByCountry');
      res.should.have.property('contact');
      res.should.have.property('activeProgramTerms');

      done();
    });
  });

  it('should insert full if data is found', function(done) {
    nock('https://members.cj.com')
      .get('/member/advertiser/1/detail.json')
      .reply(200, {advertiser: {organization: 'Foobar', programmUrl: 'A simple programm'}} )
      .get('/member/api/publisher/4406512/merchant/1/commissionsByCountry')
      .reply(200, {countryMetrics:[{countryCode: 'FR'}] })
      .get('/member/publisher/4406512/advertiser/1/activeProgramTerms.json')
      .reply(200, {activeProgramTerms: 'none'})
      .get('/member/advertiser/1/contact/4406512.json')
      .reply(200, {contact: {}})
      .get('/member/publisher/4406512/advertiserSearch.json?keywords=Foobar')
      .reply(200, {advertisers: [{advertiserId: 1, desctiption: 'Foobar'}]});

    jobs.retrieveAdvertiserInfo(1, function(err, res) {
      if (err) {
        return done(err);
      }

      res.should.have.property('full');

      done();
    });
  });

});
