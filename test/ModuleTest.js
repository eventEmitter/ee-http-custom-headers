var assert      = require('assert');

var module      = require('../index');

var Parser      = require('../lib/parser/HeaderParser'),
    Middleware  = require('../lib/ParserMiddleware');

describe('ee-rest-headers', function(){
    it('should expose the parser', function(){
        assert(module.parser === Parser);
    });

    it('should expose the middleware', function(){
        assert(module.parser === Parser);
    });

    it('should expose a shortcut parseSelect', function(){
        assert('parseSelect' in module);
    });

    it('should expose a shortcut parseOrder', function(){
        assert('parseOrder' in module);
    });

    it('should expose a shortcut parseFilter', function(){
        assert('parseFilter' in module);
    });
});