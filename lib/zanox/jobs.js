'use strict';

var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

var zanoxAuth = require('./auth');

String.prototype.clean = function() {
  return this.replace(/\n/g, '').trim();
};

var parseAdvertiserRow = function($) {
  var advertiser = {};

  $(this).find('td').each(function(i) {
    switch(i) {
      case 0:
        advertiser.name = $(this).find('.company').attr('title');
        advertiser.id = $(this).find('a').attr('href').match(/\/merchant-profile\/(\d*)/)[1];
        break;

      case 1:
        advertiser.transformationRate = $(this).text().replace('\n', '').trim();
        break;

      case 2:
        advertiser.validationRate = $(this).text().replace('\n', '').trim();
        break;

      case 3:
        advertiser.validationDelai = $(this).text().replace('\n', '').trim();
        break;

      case 4:
        advertiser.paiementDelai = $(this).text().replace('\n', '').trim();
        break;

      case 5:
        advertiser.epc = $(this).text().replace('\n', '').trim();
        break;

      case 6:
        advertiser.adRank = $(this).text().replace('\n', '').trim();
        break;

      case 7:
        advertiser.productCatalog = $(this).text().replace('\n', '').trim();
        break;

      case 8:
        advertiser.creationDate = $(this).text().replace('\n', '').trim();
        break;
    }
  });

  return advertiser;
};

var parseAdvertiserInfo = function(body) {
  var advertiserInfo = {};
  var $ = cheerio.load(body);

  advertiserInfo.name = $('.accountName h1').text().clean();
  advertiserInfo.id = $('#accountId strong').text().clean();
  advertiserInfo.image = $('#viewProfilePicture img').attr('src');

  advertiserInfo.shortDescription = $('#descriptionShort').text().clean();
  advertiserInfo.longDescription = $('#descriptionLongContent').text().clean();

  advertiserInfo.contact = {};
  advertiserInfo.contact.name = $('#profileContactContent #name').text().clean();
  advertiserInfo.contact.tel = $('#profileContactContent #tel').text().clean() || $('#profileContactContent #mob').text().clean();
  advertiserInfo.contact.email = $('#profileContactContent .tooltipTextContent').text().clean();

  advertiserInfo.mobileOptimized = $('.mobileIcon').text().clean().indexOf('Oui') !== -1 ? true : false;

  advertiserInfo.details = [];
  $('#programmeDetails .tick').each(function() {
    advertiserInfo.details.push($(this).text());
  });

  $('#profileLinksContent a').each(function() {
    if ($(this).text().trim().clean() === 'Site Web') {
      advertiserInfo.url = $(this).attr('href');
    } else {
      advertiserInfo.links = advertiserInfo.links || [];
      advertiserInfo.links.push($(this).attr('href'));
    }
  });

  return advertiserInfo;
};

module.exports.retriveAdvertisersPage = function(pageNum, cb) {
  async.waterfall([
    function authenticate(cb) {
      zanoxAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(cookieJar, userInfo, cb) {
      var url = 'https://marketplace.zanox.com/zanox/affiliate/' + userInfo.publisherId;
      url += '/merchant-directory/xhr-directory/pageNumber/' + pageNum + '/pageLength/100';

      request({
        url: url,
        method: 'POST',
        jar: cookieJar,
      }, cb);
    },
    function parseSelectedPage(res, body, cb) {
      var advertisers = [];
      var $ = cheerio.load(body);

      $('tbody tr').each(function() {
        advertisers.push(parseAdvertiserRow.call(this, $));
      });

      var data = {
        advertisers: advertisers
      };

      if (!!$('#nextPage').length) {
        data.nextPage = $('#nextPage').data('page');
      }

      cb(null, data);
    }
  ], cb);
};

var parseComissionInfo = function(body) {
  var $ = cheerio.load(body);

  var comissions = [];
  $('#merchantKeyFigures li').each(function() {
    comissions.push($(this).text());
  });

  return comissions;
};

module.exports.retrieveAdvertiserInfo = function(jobData, done) {
  var jar;
  var info;
  var data = jobData;

  async.waterfall([
    function authenticate(cb) {
      zanoxAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(cookieJar, userInfo, cb) {
      jar = cookieJar;
      info = userInfo;

      var crawleUrl = 'https://marketplace.zanox.com/zanox/affiliate/' + info.publisherId + '/' + info.adSpaceId;
      crawleUrl += '/merchant-profile/' + jobData.advertiser.id;
      var links = {
        details: crawleUrl,
        commissions: crawleUrl + '/commission-groups'
      };

      var generateLink = function(link) {
        return function(cb) {
          var url = link;
          request({ url: url, method: 'GET', jar: jar }, cb);
        };
      };

      for(var key in links) {
        var selectedLink = links[key];
        links[key] = generateLink(selectedLink);
      }

      async.parallel(links, cb);
    },
    function parseResult(res, cb) {
      data.details = parseAdvertiserInfo(res.details[1]);
      data.commissions = parseComissionInfo(res.commissions[1]);
      cb(null, data);
    }
  ], done);
};
