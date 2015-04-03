"use strict";

var   assert    = require('assert')
    , log       = require('ee-log')
    , parser    = require('../lib/parser/HeaderParser');

var   selectNewStyle
    , selectOldStyle;

selectNewStyle  = [
      "eventData[ name , id , venueFloor[ name , venue.city[ id , name , distance=distanceFrom(46,7)]]]"
    , "eventData.category.*"
    , "eventData.venueFloor.venue.name"
    , "startDate"
].join(' , ');

selectOldStyle  = [
      "eventData.category.*"
    , "eventData.venueFloor.venue.name"
    , "eventData.name"
    , "eventData.id"
    , "eventData.venueFloor.name"
    , "eventData.venueFloor.venue.city.id"
    , "eventData.venueFloor.venue.city.name"
    , "eventData.venueFloor.venue.city.distance = distanceFrom(46,7)"
    , "startDate"
].join(' , ');

describe('The Parser', function(){

    var   resultOld
        , resultNew;

    it('should parse old select syntax', function(){
        try {
            resultOld = parser.parse(selectOldStyle, 'select');
        } catch(e) { // for debugging
            throw e;
        }

    });

    it.skip('should parse new select syntax', function(){
        try {
            resultNew = parser.parse(selectNewStyle, 'select');
        } catch (e){ // for debugging
            throw e;
        }
    });

    it.skip('and generate the same result', function(){
        assert.deepEqual(resultOld, resultNew);
    });
});