"use strict";

var Class       = require('ee-class'),
    LRUCache    = require('ee-lru-cache'),
    Parser      = require('./parser/HeaderParser');

//todo: add reasonable values to the LRUCache

var ParserMiddleware = {

    _constants: {
        FILTER: 'filter',
        SELECT: 'select',
        ORDER:  'order'
    }
    , _cache: null
    , _parser: null

    , init: function initialize(cache, parser) {
        // class implementation ... feature
        this._cache     = cache || new LRUCache();
        this._parser    = parser || Parser;
    }

    , request: function(request, response, next) {

        var original = request.getHeader.bind(request);

        request.getHeader = this._getHeader(original);
        next();
    }

    /**
     * Returns the closure which hijacks the original header function
     * @param getHeaderFunc
     * @param request
     * @returns {function(this:ParserMiddleware)}
     * @private
     */
    , _getHeader: function(getHeaderFunc){

        return function(key, parse){

            // load the header value
            var headerValue = getHeaderFunc(key),
                upperKey    = key.toUpperCase(),
                parsingRule = this._constants[upperKey];

            if( headerValue !== null                // header is set
                && parse === true                   // parsing is enabled
                && parsingRule) {                   // and we are able to parse it

                if(!this._cache.has(headerValue)){
                    var result = this._parse(parsingRule, headerValue);
                    this._cache.set(headerValue, result);
                }
                return this._cache.get(headerValue);
            }

            return (parse === true) ? getHeaderFunc(key, parse) : headerValue;
        }.bind(this);
    }

    , _parse: function(key, value){
        console.time('parsing of '+key);
        var result = this._parser.parse(value, key);
        console.timeEnd('parsing of '+key);
        return result;
    }
};

module.exports = new Class(ParserMiddleware);