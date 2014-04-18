var LRUCache            = require('ee-lru-cache'),
    log                 = require('ee-log'),
    assert              = require('assert');

var ParserMiddleware    = require('./../lib/ParserMiddleware'),
    Parser              = require('./../lib/parser/HeaderParser');

var mockRequest         = {
    _headers: {
        'accept': 'Application/JSON'
        , 'filter': 'deleted=null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select': 'id, title, description'
        , 'order':  'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key];
    }
};

var mockParser          = {
    counter: 0
    , parse: function(value, rule){
        this.counter++;
        return Parser.parse(value, rule);
    }
}

describe('ParserMiddleware', function(){

    var cache           = new LRUCache(),
        middleware      = new ParserMiddleware(cache, mockParser),
        getHeaderFunc   = mockRequest.getHeader,
        accessCounter   = 0;

    describe('#request', function(){

        middleware.request(mockRequest, null, function(){

            it('should modify the get header function', function(){
                assert(mockRequest.getHeader !== getHeaderFunc);
            });

            it('should leave the headers that are not parsed untouched', function(){
                assert.equal(mockRequest.getHeader('accept'), 'Application/JSON');
            });

            it('even if parse is set to true', function(){
                assert.equal(mockRequest.getHeader('accept', true), 'Application/JSON');
            });

            it('should leave the headers untouched if parse is set to false', function(){
                assert.equal(mockRequest.getHeader('order'), mockRequest._headers['order']);
            });

            it('should parse filter headers', function(){
                assert(mockRequest.getHeader('filter', true).length == 3);
                assert(mockParser.counter===1);
            });

            it('should cache the parsed filter header', function(){
                assert(mockRequest.getHeader('filter', true).length == 3);
                assert(cache.has(mockRequest._headers['filter']));
                assert(mockParser.counter===1);
            });

            it('should parse select headers', function(){
                assert(mockRequest.getHeader('select', true).length == 3);
                assert(mockParser.counter===2);
            });

            it('should cache parsed select headers', function(){
                assert(mockRequest.getHeader('select', true).length == 3);
                assert(cache.has(mockRequest._headers['select']));
                assert(mockParser.counter===2);
            });

            it('should parse order headers', function(){
                assert(mockRequest.getHeader('order', true).length == 2);
                assert(mockParser.counter===3);
            });

            it('should cache parsed order headers', function(){
                assert(mockRequest.getHeader('order', true).length == 2);
                assert(cache.has(mockRequest._headers['order']));
                assert(mockParser.counter===3);
            });

        });
    });
});