'use strict';

var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

var zanoxAuth = require('./auth');

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
        advertisers.push(advertiser);
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
