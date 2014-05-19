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

var erroneousFilterMockRequest = {
    _headers: {
        'accept': 'Application/JSON'
        , 'filter': 'deleted == null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select': 'id > 100, title, description'
        , 'order':  'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

var erroneousSelectMockRequest = {
    _headers: {
        'accept': 'Application/JSON'
        , 'filter': 'deleted = null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select': 'id >< 100, title, description'
        , 'order':  'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

var erroneousOrderMockRequest = {
    _headers: {
        'accept': 'Application/JSON'
        , 'filter': 'deleted == null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select': 'id > 100, title, description'
        , 'order':  'id == ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

function MockParser() {
    this.counter = 0;
    this.parse = function(value, rule){
        this.counter++;
        return Parser.parse(value, rule);
    };
};

describe('ParserMiddleware', function(){

    var cache           = new LRUCache(),

        mockParser      = new MockParser(),
        mockParser2     = new MockParser(),

        middleware      = new ParserMiddleware(cache, mockParser),
        middleware2     = new ParserMiddleware(cache, mockParser2),

        getHeaderFunc   = mockRequest.getHeader;

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
                assert.equal(3, mockRequest.getHeader('filter', true).length);
                // counter is 3 because the headers are preprocessed now
                assert.equal(3, mockParser.counter);
            });

            it('should cache the parsed filter header', function(){
                assert(mockRequest.getHeader('filter', true).length == 3);
                assert(cache.has(mockRequest._headers['filter']));
                // counter is 3 because the headers are preprocessed now
                assert.equal(mockParser.counter, 3);
            });

            it('should parse select headers', function(){
                assert.equal(mockRequest.getHeader('select', true).length, 3);
                assert.equal(mockParser.counter, 3);
            });

            it('should cache parsed select headers', function(){
                assert.equal(mockRequest.getHeader('select', true).length, 3);
                assert(cache.has(mockRequest._headers['select']));
                assert.equal(mockParser.counter, 3);
            });

            it('should parse order headers', function(){
                assert.equal(mockRequest.getHeader('order', true).length, 2);
                assert.equal(mockParser.counter, 3);
            });

            it('should cache parsed order headers', function(){
                assert.equal(mockRequest.getHeader('order', true).length, 2);
                assert(cache.has(mockRequest._headers['order']));
                assert.equal(mockParser.counter, 3);
            });

        });
    });
    describe('#request (with syntax errors)', function(){

        describe('on filter', function(){
            middleware2.request(erroneousFilterMockRequest, {send: function(state, message){
                it('should generate a 400 error if syntax errors occur', function(){
                    assert.equal(state, 400);
                });
                it('should create an error message', function(){
                    assert(!!message);
                });
            }}, function(){
                it('should never call the passed next method on errors', function(){
                    assert(false);
                });
            });
        });

        describe('on order', function(){
            middleware2.request(erroneousOrderMockRequest, {send: function(state, message){
                it('should generate a 400 error if syntax errors occur', function(){
                    assert.equal(state, 400);
                });
                it('should create an error message', function(){
                    assert(!!message);
                });
            }}, function(){
                it('should never call the passed next method on errors', function(){
                    assert(false);
                });
            });
        });


        describe('on select', function(){
            middleware2.request(erroneousSelectMockRequest, {send: function(state, message){
                it('should generate a 400 error if syntax errors occur', function(){
                    assert.equal(state, 400);
                });
                it('should create an error message', function(){
                    assert(!!message);
                });
            }}, function(){
                it('should never call the passed next method on errors', function(){
                    assert(false);
                });
            });
        });
    });
});