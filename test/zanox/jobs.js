'use strict';

var nock = require('nock');

var jobs = require('../../lib/zanox/jobs');
var testAuthHelper = require('./auth');

describe('[Zanox] Jobs', function () {
  beforeEach(function(done) {
    testAuthHelper.mockAuthRequest();
    done();
  });

  describe('Retrive advertisers page', function() {
    it('should return the selected advertiser page', function(done) {
      nock('https://marketplace.zanox.com')
        .post('/zanox/affiliate/1156722/merchant-directory/xhr-directory/pageNumber/1/pageLength/100')
        .replyWithFile(200, __dirname + '/files/listPage.html');

      jobs.retriveAdvertisersPage(1, function(err, res) {

        res.advertisers.should.have.a.lengthOf(2);
        res.nextPage.should.have.be.eql(2);

        res.advertisers.should.matchEach(function(ad) {
          return ad.should.have.properties('id', 'name');
        });

        done(err);
      });
    });

    it('should not add nextPage property if last page', function(done) {
      nock('https://marketplace.zanox.com')
        .post('/zanox/affiliate/1156722/merchant-directory/xhr-directory/pageNumber/10/pageLength/100')
        .replyWithFile(200, __dirname + '/files/lastListPage.html');

      jobs.retriveAdvertisersPage(10, function(err, res) {

        res.advertisers.should.have.a.lengthOf(2);
        res.should.not.have.property('nextPage');

        done(err);
      });
    });
  });

  describe('Retrive advertisers informations', function() {
    it('should be able to parse the page', function(done) {
      var offers = '<div id="merchantKeyFigures"><ul><li><strong>Lead</strong> EUR 0.50</li>';
      offers += '<li><strong>Vente</strong> EUR 1.00 - EUR 19.00</li></ul></div>';

      nock('https://marketplace.zanox.com')
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124')
        .replyWithFile(200, __dirname + '/files/detailPage.html')
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124/commission-groups')
        .reply(200, offers)
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124/xhr-commission-group-search/page/1')
        .replyWithFile(200, __dirname + '/files/comissionsDetailPage1.html')
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124/xhr-commission-group-search/page/2')
        .replyWithFile(200, __dirname + '/files/comissionsDetailPage2.html');

      jobs.retrieveAdvertiserInfo({
        advertiser: {
          id: 3124
        }
      }, function(err, res) {

        res.should.have.property('comissions');
        res.comissions.should.have.properties('defaultComissions', 'comissionsItems');
        res.comissions.defaultComissions.should.have.a.lengthOf(2);
        res.comissions.comissionsItems.should.have.a.lengthOf(18);

        res.should.have.property('details');
        res.details.should.have.properties('name', 'id', 'image', 'shortDescription', 'longDescription', 'contact', 'url', 'cookies');
        done(err);
      });
    });

    it('should be able handle multi-level comissions', function(done) {
      var offers = '<div id="merchantKeyFigures"><ul><li><strong>Lead</strong> EUR 0.50</li>';
      offers += '<li><strong>Vente</strong> EUR 1.00 - EUR 19.00</li></ul></div>';

      nock('https://marketplace.zanox.com')
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124')
        .replyWithFile(200, __dirname + '/files/detailPage.html')
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124/commission-groups')
        .reply(200, offers)
        .get('/zanox/affiliate/1156722/1193212/merchant-profile/3124/xhr-commission-group-search/page/1')
        .replyWithFile(200, __dirname + '/files/comissionsDetailVariable.html');

      jobs.retrieveAdvertiserInfo({
        advertiser: {
          id: 3124
        }
      }, function(err, res) {

        res.should.have.property('comissions');
        res.comissions.comissionsItems.should.have.a.lengthOf(10);
        res.comissions.comissionsItems.filter(function(item) {
          return item['Lead (fix)'];
        }).should.have.a.lengthOf(6);

        done(err);
      });
    });

  });
});
