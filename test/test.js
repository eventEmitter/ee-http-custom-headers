var parser  = require('./../lib/parser/HeaderParser'),
    log     = require('ee-log'),
    mocha   = require('mocha'),
    assert  = require('assert');

describe('The parser for ', function(){
    describe('names', function(){
        var node = parser.parse('testName', 'name');
        it('should create a variable node ', function(){
            assert.equal('testName', node.getName());
        });
        it('which has no parent', function(){
            assert.equal(null, node.getParent());
        });
        it('and no tags', function(){
           assert.equal(0, node.getTags().length);
        });
    });

    describe('dotted names (properties)', function(){

        it('should handle simple names', function(){
            var node = parser.parse('testName', 'name_dotted');
            assert.equal('testName', node.getName());
            assert(!node.hasParent());
        });

        var node = parser.parse('user.profile.id', 'name_dotted');
        it('should handle compound names (properties)', function(){
            assert.equal('id', node.getName());
            assert(node.hasParent());
        });

        it('should create a hierarych', function(){
            var hierarchy = node.getHierarchy();
            assert.equal(3, hierarchy.length);

            assert.equal('user', hierarchy[0].getName());
            assert.equal('profile', hierarchy[1].getName());
            assert.equal('id', hierarchy[2].getName());

            assert.deepEqual(node.getParent(), hierarchy[1]);
        });

        it('should trace their parents', function(){
            assert.equal('profile', node.getParent().getName());
            assert(node.getParent().hasParent());
            assert.equal('user', node.getParent().getParent().getName());
        });
    });
});
/*
 parser.parse("halo.dings.bums", "select").pop().getHierarchy()
 log(parser.parse("halo.dings.bums", "name_dotted"));
 log(parser.parse("[1, 3, 4]", "array"));
 log(parser.parse("action(1, 3, false)", "function"));
 log(parser.parse("id, thing.dings"), "select");
 log(parser.parse("id=10, created!=null", "filter"));
 log(parser.parse("id, created DESC", "order"));*/

/*log(parser.parse("dings.id>2013-20-12", "comp"));*/