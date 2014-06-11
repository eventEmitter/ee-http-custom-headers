"use strict";

var   Class = require('ee-class')
    , log   = require('ee-log');

var RestHeaderError = {
      inherits: Error
    , init: function initialize(message) {
        initialize.super.call(this, message);
        Error.captureStackTrace(this, initialize);
    }
};

module.exports = new Class(RestHeaderError);