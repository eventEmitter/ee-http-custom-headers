"use strict";

var Class       = require('ee-class'),
    LRUCache    = require('ee-lru-cache'),
    Types       = require('ee-types'),
    log         = require('ee-log'),
    Parser      = require('./parser/HeaderParser');

var ParserMiddleware = {

    _constants: {
        FILTER: 'filter',
        SELECT: 'select',
        ORDER:  'order'
    }
    , _cache: null
    , _parser: null

    , init: function initialize(cache, parser) {
        this._cache     = cache || new LRUCache();
        this._parser    = parser || Parser;
    }

    , request: function(request, response, next) {
        var original = request.getHeader.bind(request);
        request.getHeader = this._getHeader(original);
        this._preparseHeadersAndProceed(request, response, next);
    }

    /**
     * Triggers the parsing of the headers and proceeds middleware invocation if syntax is correct.
     *
     * @param request
     * @param response
     * @param next
     * @private
     */
    , _preparseHeadersAndProceed: function(request, response, next){
        var name;
        try {
            for(var key in this._constants){
                name = key;
                request.getHeader(this._constants[key], true);
            }
            next();
        } catch(err){
            var message = 'Invalid '+name+' header syntax: '+err.message;
            if(!Types.undefined(err.line) && !Types.undefined(err.column)){
                message += '( line: '+err.line+' column: '+err.column+')';
            }
            response.send(400, message);
        }
    }

    , _resolveParsingRule: function(key){
        var   upperKey  = key.toString().toUpperCase();
        return this._constants[upperKey] || false;
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
                parsingRule = this._resolveParsingRule(key);
            if( !Types.null(headerValue)
                && !Types.undefined(headerValue)    // header is set
                && parse === true                   // parsing is enabled
                && parsingRule) {                   // and we are able to parse it

                if(this._cache.has(headerValue)){
                    return this._cache.get(headerValue);
                }

                var result = this._parse(parsingRule, headerValue);
                this._cache.set(headerValue, result);
                return result;
            }

            return (parse === true) ? getHeaderFunc(key, parse) : headerValue;
        }.bind(this);
    }

    , _parse: function(key, value){
        return this._parser.parse(value, key);
    }
};

module.exports = new Class(ParserMiddleware);