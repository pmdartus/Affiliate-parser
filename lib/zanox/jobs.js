'use strict';

var async = require('async');
var _ = require('lodash');
var request = require('request');
var cheerio = require('cheerio');

var zanoxAuth = require('./auth');

/**
 *  Helpers
 */

String.prototype.clean = function() {
  return this.replace(/\n/g, '').trim();
};

/**
 * Parsers
 */

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

  advertiserInfo.cookies = [];
  $('#programmeDetails .tick').each(function() {
    advertiserInfo.cookies.push($(this).text());
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

var retrieveComissions = function(advertiserId, userInfo, cb) {
  var baseUrl = 'https://marketplace.zanox.com/zanox/affiliate/' + userInfo.publisherId + '/' + userInfo.adSpaceId;

  async.parallel({
    defaultComissions: function(cb) {
      var url = baseUrl + '/merchant-profile/' + advertiserId + '/commission-groups';

      zanoxAuth.request(url, 'GET', function(err, res) {
        if (err) {
          return cb(err);
        }

        var $ = cheerio.load(res);

        var defaultComissions = [];
        $('#merchantKeyFigures li').each(function() {
          defaultComissions.push($(this).text());
        });

        cb(null, defaultComissions);
      });
    },

    comissionsItems: function(cb) {
      var url = baseUrl + '/merchant-profile/' + advertiserId + '/xhr-commission-group-search';
      var comissionsItems = [];
      var nextPage = 1;

      async.doWhilst(
        function loopPages(cb) {
          var pageUrl = url + '/page/' + nextPage;
          zanoxAuth.request(pageUrl, 'GET', function(err, res) {
            if (err) {
              return cb(err);
            }

            var $ = cheerio.load(res);

            // Retrieve all data in the table
            $('table tr').each(function() {
              var item = {};

              $(this).find('td').each(function(i) {
                if (i === 0) {
                  item.name = $(this).text().clean();
                } else if (i === 1) {
                  item.flatRate = $(this).text().clean();
                } else {
                  item.percentRate = $(this).text().clean();
                }
              });

              // Only push if a name hase been added
              // Avoid header to be pushed
              if (item.name) {
                comissionsItems.push(item);
              }
            });

            // Check if there is a next page to load
            if (!!$('#nextPage').length) {
              nextPage = $('#nextPage').data('page');
            } else {
              nextPage = null;
            }

            cb();
          });
        },
        function testHasNext() {
          return nextPage;
        },
        function (err) {
          return cb(err, comissionsItems);
        }
      );
    }
  }, function(err, res) {
    cb(err, {
      defaultComissions : res.defaultComissions,
      comissionsItems : res.comissionsItems
    });
  });
};

/**
 *  Jobs
 */

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

module.exports.retrieveAdvertiserInfo = function(jobData, done) {
  var data = jobData;

  async.waterfall([
    function authenticate(cb) {
      zanoxAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(cookieJar, info, cb) {
      async.parallel({
        details: function(cb) {
          var crawleUrl = 'https://marketplace.zanox.com/zanox/affiliate/' + info.publisherId + '/' + info.adSpaceId;
          crawleUrl += '/merchant-profile/' + jobData.advertiser.id;

          zanoxAuth.request(crawleUrl, 'GET', function(err, res) {
            if (err) {
              return cb(err);
            }

            cb(null, parseAdvertiserInfo(res));
          });
        },
        comissions: function(cb) {
          retrieveComissions(jobData.advertiser.id, info, cb);
        }
      }, cb);
    } ,
    function mergeData(res, cb) {
      cb(null, _.merge(data, res));
    }
  ], done);
};
