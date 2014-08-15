var PEG     = require('pegjs');
    log     = require('ee-log'),
    mocha   = require('mocha'),
    assert  = require('assert');

var parser = require('../lib/parser/HeaderParser');
describe('HeaderParser', function(){

    describe('value', function(){
        it('should also parse functions', function(){
            var node = parser.parse('range(100, 10)', 'value');
        });
    });

    describe('values', function(){
        it('should create a collection and strip delimiters', function(){
            var node = parser.parse('100, 10', 'values');
            assert.equal(2, node.length);
            assert.equal(10, node[1].value);
        });
    });

    describe('string', function(){
        it('should parse strings in single quotes', function(){
            var node = parser.parse("'single quoted'", 'value');
            assert.equal(node.value, "single quoted");
        });

        it('should parse strings in double quotes', function(){
            var node = parser.parse('"double quoted"', 'value');
            assert.equal(node.value, "double quoted");
        });

        it('should parse escaped strings', function(){
            var node = parser.parse('"double \\"quoted"', 'value');
            assert.equal(node.value, 'double \\"quoted');
        });

        it('should parse special characters', function(){
            var node = parser.parse('"wäääu"', 'value');
            assert.equal(node.value, 'wäääu');
        });
    });

    describe('names', function() {

        var node;

        it('should create an identifier node', function(){
            node = parser.parse('testName', 'identifier');
            assert.equal('testName', node.getName());
        });

        it('which has no accesses', function(){
           assert.equal(false, node.hasAccesses());
        });

        it('should allow wildcards', function(){
            var node = parser.parse('*', 'identifier');
            assert.equal('*', node.getName());
        });
    });

    describe('dotted names (properties)', function(){

        var node;

        it('should allow wildcards', function(){
            node = parser.parse('user.profile.*', 'identifier');
            assert.equal('user', node.getName());
            assert.equal(true, node.hasAccesses());
        });


        it('should handle compound names', function(){
            node = parser.parse('user.profile.id', 'identifier');
            assert.equal('user', node.getName());
            assert.equal(true, node.hasAccesses());
            assert.equal(2, node.getAccesses().length);
        });

    });

    describe('tagged names (ordering)', function(){

        it('should handle single names with tag', function(){
            var node = parser.parse("date ASC", 'order_item');
            assert.equal('date', node.value.getName());
            assert.equal('ASC', node.direction);
        });

        it('should handle compound names with tag', function(){
            var node = parser.parse("date.month DESC", 'order_item');
            assert.equal('date', node.value.getName());
            assert(node.value.hasAccesses());
            assert.equal('DESC', node.direction);
        });
    });

    describe('arrays', function(){

        it('should be able to parse arrays of an arbitrary length', function(){
            var node = parser.parse('[1, 2, 3, [true, false], avg([1,3,4])]', 'array');
            assert.equal(5, node.length);
            assert(node[3][0]);
            assert.equal(3, node[2]);
            assert(node[4].accept({visitActionNode: function(an){
                return true;
            }}));
        });

        it('should be able to parse empty arrays', function(){
            var node = parser.parse('[ ]', 'array');
            assert.equal(0, node.length);
        });
    });

    describe('actions (functions)', function() {

        it('should parse actions without parameters', function(){
            var node = parser.parse('maxint()', 'function');
            assert.equal('maxint', node.getName());
            assert(!node.hasParameters());
        });

        it('should parse actions with parameters', function(){
            var node = parser.parse('map([1, 2, 3], "average")', 'function');
            assert.equal("map", node.getName());
            assert(node.hasParameters())
            assert.equal(2, node.getParameters().length)
        });

        it('should properly parse nested actions', function(){
            var node = parser.parse('map([1, 2, 3], "average", is_enabled())', 'function');
            assert.equal("map", node.getName());
            assert(node.hasParameters());
            assert.equal(3, node.getParameters().length);

            nested = node.getParameters()[2];
            assert.equal('is_enabled', nested.getName());
            assert(!nested.hasParameters());
        })
    });

    describe('projection (select)', function(){

        it('should handle single fields', function(){
            var node = parser.parse('id', 'select');
            assert.equal(1, node.length);
            assert.equal('id', node[0].getName())
        });

        it('should handle arbitrary fields', function(){
            var node = parser.parse('id, firstName, lastName, profile.id', 'select');

            assert.equal('id', node[0].getName());
            assert.equal('lastName', node[2].getName());
            assert.equal('profile.id', node[3].toString());
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', id, firstName, lastName, profile.id ,', 'select');
            assert.equal('id', node[0].getName());
            assert.equal('lastName', node[2].getName());
            assert.equal('profile.id', node[3].toString());
        });
    });

    describe('ordering', function(){
        it('should handle a single tagged order', function(){
            var node = parser.parse('created DESC', 'order');
            assert.equal(1, node.length);
            assert.equal('DESC', node[0].direction);
        });

        it('should handle mixed orderings', function(){
            var node = parser.parse('user.id, created RAND', 'order');

            assert.equal(2, node.length);
            assert.equal('user.id', node[0].value.toString());
            assert.equal('RAND', node[1].direction);
        });

        it('should handle orderings by action', function(){
            var node = parser.parse('user.id, RAND(created)', 'order');
            assert.equal(2, node.length);
            assert.equal('user.id', node[0].value.toString());
            assert.equal('RAND', node[1].value.getName());
            assert(node[1].value.hasParameters());
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', priority ,', 'order');
            assert.equal(1, node.length);
            assert.equal('priority', node[0].value.getName());
        });

    });

    describe('date', function() {

        it('should handle dates without time', function(){
            var node = parser.parse('2013-12-24', 'date');
            node = node.getValue();

            assert(node instanceof Date);
            assert.equal(2013, node.getFullYear());
            assert.equal(11, node.getMonth());
            assert.equal(24, node.getDate());
            assert.equal(0, node.getHours());
            assert.equal(0, node.getMinutes());
            assert.equal(0, node.getSeconds());
            assert.equal(0, node.getMilliseconds());
        });

        it('should handle dates with time', function(){
            var node = parser.parse('2000-01-04 10:15:03', 'date');
            node = node.getValue();

            assert(node instanceof Date);
            assert.equal(2000, node.getFullYear());
            assert.equal(0, node.getMonth());
            assert.equal(4, node.getDate());
            assert.equal(10, node.getHours());
            assert.equal(15, node.getMinutes());
            assert.equal(3, node.getSeconds());
            assert.equal(0, node.getMilliseconds());
        });
    });

    describe('comparison', function(){

        it('should handle equality', function(){
            var node = parser.parse('user.birthday = 1985-03-13', 'comp');
            assert(node.comparatorIs('='));
        });

        it('should handle inequality', function(){
            var node = parser.parse('user.birthday != null', 'comp');
            assert(node.comparatorIs('!='));
        });

        it('should handle more than', function(){
            var node = parser.parse('user.birthday > NOW()', 'comp');
            assert(node.comparatorIs('>'));
        });

        it('should handle less than', function(){
            var node = parser.parse('user.birthday < NOW()', 'comp');
            assert(node.comparatorIs('<'));
        });

        it('should handle less or equal than', function(){
            var node = parser.parse('user.birthday <= 2000-02-23', 'comp');
            assert(node.comparatorIs('<='));
        });

        it('should handle more or equal than', function(){
            var node = parser.parse('user.birthday >= 2000-02-23', 'comp');
            assert(node.comparatorIs('>='));
        });

        it('should handle like', function(){
            var node = parser.parse('user.birthday LIKE "%2000-02-23"', 'comp');
            assert(node.comparatorIs('like'));
        });
    });

    describe('filter', function(){

        it('should handle single constraints', function(){
            var node = parser.parse('user.fb != null', 'filter');
            assert.equal(1, node.length);
        });

        it('should handle multiple constraints', function(){
            var node = parser.parse('user.fb != null, credits >= 100', 'filter');
            assert.equal(2, node[0].length);
        });

        it('should parse mixed filters', function(){
            var node = parser.parse('id > 10, dings = range(100, 10)', 'filter');
            assert.equal(2, node[0].length);
        });

        it('should parse mixed filters 2', function(){
            var node = parser.parse('location.address.postalcode > 4500, location.address.postalcode < 4500, deleted = null', 'filter');
            assert.equal(3, node[0].length);
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', location.address.postalcode > 4500, location.address.postalcode < 4500, deleted = null ,', 'filter');
            assert.equal(3, node[0].length);
        });

        it('should handle single constraints', function(){
            var node = parser.parse('user.fb != null', 'filter');
            assert.equal(1, node.length);
        });

        it('should handle multiple constraints', function(){
            var node = parser.parse('user.fb != null, credits >= 100', 'filter');
            assert.equal(2, node[0].length);
        });

        it('should parse the like operator in filters', function(){
            var node = parser.parse('name LIKE "some%one"', 'filter');
            assert.equal(1, node.length);
            assert.equal(node[0][0].comparator, 'LIKE');
            assert.equal(node[0][0].identifier.name, 'name');
            assert.equal(node[0][0].value.value, 'some%one');
        });

        it('the like operator should be case insensitive and return the operator in upper case', function(){
            var node = parser.parse('name liKe "some%one", id = 100', 'filter');
            assert.equal(1, node.length);
            assert.equal(node[0][0].comparator, 'LIKE');
            assert.equal(node[0][0].identifier.name, 'name');
            assert.equal(node[0][0].value.value, 'some%one');
        });

        it('should be able to parse the or operator', function(){
            var node = parser.parse('user.birtdate > 1986-31-12 | user.birthdate < 1985-01-01', 'filter');
            assert.equal(2, node.length);
            assert.equal(node[0][0].comparator, '>');
            assert.equal(node[0][0].identifier.name, 'user');
        });

        it('and should have higher precedence than or', function(){
            var node = parser.parse('user.birtdate > 1986-31-12 | user.birthdate < 1985-01-01, user.deleted != null', 'filter');
            assert.equal(2, node.length);
            assert.equal(2, node[1].length);
        });

        it('except the or is grouped', function(){
            var node = parser.parse('(user.birtdate > 1986-31-12 | user.birthdate < 1985-01-01) , user.deleted != null', 'filter');
            assert.equal(1, node.length)
            // the and relation
            assert.equal(2, node[0].length);
            // the inner or
            assert.equal(2, node[0][0].length);
        });

        it('should handle parentheses around the whole statement', function(){
            var node = parser.parse('(user.deleted != null)', 'filter');
        });

    });
});