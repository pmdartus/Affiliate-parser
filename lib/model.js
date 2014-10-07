'use strict';

/**
 *  Module depences
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *  Extracted data schema
 */

var RawExtractSchema = new Schema ({
  created: {
    type: Date,
    default: Date.now
  },

  updated: {
    type: Date,
    default: Date.now
  },

  id: {
    type: String,
    required: true
  },

  platform:  {
    type: String,
    required: true
  },

  data: {}
});

RawExtractSchema.index({ platform: 1, id: 1 }, { unique: true });
RawExtractSchema.set('autoIndex', true);

/**
 *  Create or update the selected advertiser
 *
 *  @params {string} id
 *  @params {string} platform
 *  @params {object} data
 *  @params {function} cb
 *
 *  @api static
 */

RawExtractSchema.statics.findAndUpdate = function (id, platform, data, cb) {
  this.findOneAndUpdate({
    id: id,
    platform: platform
  }, {
    updated: new Date(),
    data: data
  }, {
    upsert: true
  }, cb);
};

/**
 *  Register the model
 */
mongoose.model('RawExtract', RawExtractSchema);
