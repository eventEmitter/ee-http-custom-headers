var LRUCache            = require('ee-lru-cache'),
    log                 = require('ee-log'),
    assert              = require('assert');

var ParserMiddleware    = require('./../lib/ParserMiddleware'),
    Parser              = require('./../lib/parser/HeaderParser');

var mockRequest         = {
    _headers: {
          'accept'  : 'Application/JSON'
        , 'filter'  : 'deleted=null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select'  : 'id, title, description'
        , 'order'   : 'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key];
    }
};

var erroneousFilterMockRequest = {
    _headers: {
        'accept'    : 'Application/JSON'
        , 'filter'  : 'deleted == null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select'  : 'id > 100, title, description'
        , 'order'   : 'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

var erroneousSelectMockRequest = {
    _headers: {
          'accept'  : 'Application/JSON'
        , 'filter'  : 'deleted = null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select'  : 'id >< 100, title, description'
        , 'order'   : 'id ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

var erroneousOrderMockRequest = {
    _headers: {
        'accept'    : 'Application/JSON'
        , 'filter'  : 'deleted == null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select'  : 'id > 100, title, description'
        , 'order'   : 'id == ASC, date DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

var repeatingRequest = {
    _headers: {
          'accept'  : 'Application/JSON'
        , 'filter'  : 'deleted = null, venues.address.postalcode<4500, venues.address.postalcode>4500'
        , 'select'  : 'id, title, description'
        , 'order'   : 'job.created DESC'
    }

    , getHeader: function(key, parse){
        return this._headers[key] || null;
    }
};

function MockCache(){
    this.storage = {};
    this.reads = 0;
    this.writes = 0;
    this.checks = 0;
}
MockCache.prototype.get = function(key){
    this.reads++;
    return this.storage[key];
};
MockCache.prototype.set = function(key, value){
    this.writes++;
    this.storage[key] = value;
};
MockCache.prototype.has = function(key){
    this.checks++;
    return this.storage[key] !== undefined;
};

function MockParser() {
    this.counter = 0;
    this.parse = function(value, rule){
        this.counter++;
        return Parser.parse(value, rule);
    };
};

describe('ParserMiddleware', function(){

    var getHeaderFunc   = mockRequest.getHeader.bind(mockRequest);

    describe('#request', function(){

        var   cache         = new MockCache()
            , parser        = new MockParser()
            , middleware    = new ParserMiddleware(cache, parser);

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
                assert.equal(1, mockRequest.getHeader('filter', true).length);
                assert.equal(3, parser.counter);
            });

            it('should cache the parsed filter header', function(){
                assert(1, mockRequest.getHeader('filter', true).length);
                // counter is 3 because the headers are preprocessed now
                assert.equal(parser.counter, 3);
            });

            it('should parse select headers', function(){
                assert.equal(mockRequest.getHeader('select', true).length, 3);
                assert.equal(parser.counter, 3);
            });

            it('should cache parsed select headers', function(){
                assert.equal(mockRequest.getHeader('select', true).length, 3);
                assert.equal(parser.counter, 3);
            });

            it('should parse order headers', function(){
                assert.equal(mockRequest.getHeader('order', true).length, 2);
                assert.equal(parser.counter, 3);
            });

            it('should cache parsed order headers', function(){
                assert.equal(mockRequest.getHeader('order', true).length, 2);
                assert.equal(parser.counter, 3);
            });

        });
    });

    describe('#request (repeating)', function(){
        describe('order', function(){

            var   cache         = new MockCache()
                , parser        = new MockParser()
                , middleware    = new ParserMiddleware(cache, parser)
                , firstResult;

            it('should parse the order headers correctly', function(done){
                middleware.request(repeatingRequest, {send: function(state, message){
                    done(new Error('Should not call the send method directly if no error is present'));
                }}, function(){

                    var result = repeatingRequest.getHeader('order', true);

                    assert(result);

                    assert.equal(3, cache.writes, 'Cache writes for order filter');
                    assert.equal(4, cache.checks, 'Cache checks when warming up the cache');
                    assert.equal(1, cache.reads,  'Cache reads when receiving');
                    // the parser is only invoked tree times (once per header)
                    assert.equal(3, parser.counter);

                    firstResult = result;

                    done();

                });
            });

            it('should parse the order headers correctly when repeating', function(done){
                middleware.request(repeatingRequest, {send: function(state, message){
                    done(new Error('Should not call the send method directly if no error is present'));
                }}, function(){

                    var result = repeatingRequest.getHeader('order', true);

                    assert(result);

                    assert.equal(3, cache.writes);
                    assert.equal(8, cache.checks);
                    assert.equal(5, cache.reads);
                    // the parser is only invoked tree times (once per header)
                    assert.equal(3, parser.counter);
                    assert.deepEqual(result, firstResult);

                    done();

                });
            });
        });
    });

    describe('#request (with syntax errors)', function(){

        describe('on filter', function(){

            var   cache         = new MockCache()
                , parser        = new MockParser()
                , middleware    = new ParserMiddleware(cache, parser);

            middleware.request(erroneousFilterMockRequest, {send: function(state, message){
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

            var   cache         = new MockCache()
                , parser        = new MockParser()
                , middleware    = new ParserMiddleware(cache, parser);

            middleware.request(erroneousOrderMockRequest, {send: function(state, message){
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

            var   cache         = new MockCache()
                , parser        = new MockParser()
                , middleware    = new ParserMiddleware(cache, parser);

            middleware.request(erroneousSelectMockRequest, {send: function(state, message){
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
