var   log     = require('ee-log')
    , assert  = require('assert');


var   parser    = require('../lib/parser/HeaderParser')
    , pAssert   = require('./ParserAssertion').forParser(parser);

function compareNodeName(asserter, input, name){
    var node = asserter.parse(input);
    assert.equal(name, node.getName());
    return node;
}

describe('HeaderParser', function(){

    describe('value', function(){

        var value = pAssert.forRule('value');

        it('should also parse functions', function(done){
            var node = value.parse('range(100, 10)');
            assert.equal(2, node.getParameters().length);
            node.accept({
                visitActionNode : function(node) {
                    assert(true);
                    done();
                }
            });
        });

        it('should properly convert booleans', function(){
            value.transformAndParseTo('true', function(result){ return result.value; }, true, true);
            value.transformAndParseTo('false', function(result){ return result.value; }, false, true);
        });

    });

    describe('string', function(){

        var str = pAssert.forRule('value');

        it('should parse strings in single quotes', function(){
            assert.equal(str.parse("'single quoted'").value, "single quoted");
        });

        it('should parse strings in double quotes', function(){
            var node = str.parse('"double quoted"');
            assert.equal(node.value, "double quoted");
        });

        it('should parse escaped strings', function(){
            var node = str.parse('"double \\"quoted"');
            assert.equal(node.value, 'double \\"quoted');
        });

        it('should parse special characters', function(){
            var node = str.parse('"wäääu"');
            assert.equal(node.value, 'wäääu');
        });
    });

    describe('identifiers', function(){

        var identifier = pAssert.forRule('identifier');

        it('should parse a valid identifier', function(){
            var input = 'indentificado';
            identifier.parseTo(input, input);
        });

        it('should not parse the wildcard', function(){
            identifier.fail('*');
        });

        it('should not parse invalid identifiers', function(){
            identifier.fail('1some');
        });
    });

    describe('access_dot', function(){

        var   access_dot = pAssert.forRule('access_dot')
            , node;

        it('should parse a single access', function(){
            node = compareNodeName(access_dot, '.name', 'name');
            assert.equal(null, node.getParent());
        });

        it('should parse nested accesses', function(){
            node = compareNodeName(access_dot, '.venue.venueFloor.size', 'size');
            assert(node.hasParent());
            assert.equal(node.getParent().getName(), 'venueFloor');
            assert.equal(node.getParent().getParent().getName(), 'venue');
        });

        it('should fail on wildcards (they are part of the access)', function(){
            access_dot.fail('.venue.*');
        });
    });



    describe('selector', function(){

        var   selector = pAssert.forRule('selector')
            , node;

        it('should parse a valid identifier', function(){

            var   input     = "identificatione"
                , result    = selector.parse(input)
                , node      = result[0];

            assert.equal(node.getName(), input);
        });

        it('should parse the wildcard', function(){
            var   input     = "*"
                , result    = selector.parse(input)
                , node      = result[0];

            assert.equal(node.getName(), input);
        });

        it('should not allow accesses on the wildcard', function(){
            selector.fail('*.someField');
        });

        it('should not parse invalid identifiers', function(){
            selector.fail('1some');
        });

        it('name should fail on function names (lookahead)', function(){
            selector.fail('funzioniii()');
        });

        it('should create a variable node ', function(){
            var result = selector.parse('testName');
            node = result[0];
            assert.equal('testName', node.getName());
        });

        it('which has no parent', function(){
            assert.equal(null, node.getParent());
        });

        it('and no tags', function(){
            assert.equal(0, node.getTags().length);
        });

        it('should allow wildcards at the end', function(){
            var result = selector.parse('user.profile.*');
            node = result[0];

            assert.equal(node.getName(), '*');
            assert(node.hasParent());
        });

        it('allows single wildcards', function(){
            var result = selector.parse('*');
            node = result[0];
            assert.equal('*', node.getName());
            assert(node.isWildcard());
            assert(!node.hasParent());
        });

        it('should handle compound names (properties)', function(){
            var result = selector.parse('user.profile.id');
            node = result[0];
            assert.equal('id', node.getName());
            assert(node.hasParent());

            assert.equal(node.getParent().getName(), 'profile');
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

    describe('tagged names (ordering)', function(){

        it.skip('should handle single names with tag', function(){
            var node = parser.parse("date ASC", 'name_tagged');
            assert.equal(1, node.getTags().length);
            assert.equal('date', node.getName());
            assert.equal('ASC', node.getTags()[0]);
        });

        it.skip('should handle compound names with tag', function(){
            var node = parser.parse("date.month DESC", 'name_tagged');
            assert.equal(1, node.getTags().length);
            assert.equal('month', node.getName());
            assert.equal('DESC', node.getTags()[0]);
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

            var nested = node.getParameters()[2];
            assert.equal('is_enabled', nested.getName());
            assert(!nested.hasParameters());
        })
    });

    describe('projection (select)', function(){

        it('should handle single fields', function(){
            var node = parser.parse('id', 'select');
            assert.equal(1      , node.length);
            assert.equal('id'   , node[0].property.getName());
        });

        it('should handle arbitrary fields', function(){
            var node = parser.parse('id, firstName, lastName, profile.id', 'select');
            assert.equal('id'           , node[0].property.getName());
            assert.equal('lastName'     , node[2].property.getName());
            assert.equal('profile.id'   , node[3].property.flattenName());
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', id, firstName, lastName, profile.id ,', 'select');
            assert.equal('id'           , node[0].property.getName());
            assert.equal('lastName'     , node[2].property.getName());
            assert.equal('profile.id'   , node[3].property.flattenName());
            assert.equal(false          , node[0].isAlias());
        });

        it('should support aggregate functions (aliases)', function(){

            var   node      = parser.parse('profile.rating = avg(profile.items.ratings, true)', 'select')
                , result    = node[0];

            assert.strictEqual(true , result.isAlias());
            assert.equal('rating'   , result.property.getName());

            assert(result.property.hasParent());
            assert.equal('profile'  , result.property.getParent().getName());
        });
    });

    describe('ordering', function(){
        it('should handle a single tagged order', function(){
            var node = parser.parse('created DESC', 'order');
            assert.equal(1              , node.length);
            assert.equal('DESC'         , node[0].getTags()[0]);
        });

        it('should handle mixed orderings', function(){
            var node = parser.parse('user.id, created RAND', 'order');
            assert.equal(2, node.length);
            assert.equal('user.id', node[0].flattenName());
            assert(!node[0].hasTags());
            assert.equal('RAND', node[1].getTags()[0]);
        });

        it('should handle orderings by action', function(){
            var node = parser.parse('user.id, RAND(created)', 'order');
            assert.equal(2, node.length);
            assert.equal('user.id', node[0].flattenName());
            assert.equal('RAND', node[1].getName());
            assert(node[1].hasParameters());
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', priority ,', 'order');
            assert.equal(1, node.length);
            assert.equal('priority', node[0].getName());
        });

    });

    describe('date', function() {

        it('should handle dates without time', function(){
            var value_node = parser.parse('2013-12-24', 'date');
            var node = value_node.getValue();

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
            var value_node = parser.parse('2000-01-04 10:15:03', 'date');
            var node = value_node.getValue();

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
            assert(node.testsEquality());
            assert(!node.testsInequality());
        });

        it('should handle inequality', function(){
            var node = parser.parse('user.birthday != null', 'comp');
            assert(node.testsInequality());
            assert(!node.testsMoreThan());
        });

        it('should handle more than', function(){
            var node = parser.parse('user.birthday > NOW()', 'comp');
            assert(node.testsMoreThan());
            assert(!node.testsLessThan());
        });

        it('should handle less than', function(){
            var node = parser.parse('user.birthday < NOW()', 'comp');
            assert(!node.testsMoreThan());
            assert(node.testsLessThan());
        });

        it('should handle less or equal than', function(){
            var node = parser.parse('user.birthday <= 2000-02-23', 'comp');
            assert(!node.testsMoreThan());
            assert(node.testsLessOrEqual());
        });

        it('should handle more or equal than', function(){
            var node = parser.parse('user.birthday >= 2000-02-23', 'comp');
            assert(node.testsMoreOrEqual());
            assert(!node.testsLessOrEqual());
        });
    });

    describe('filter', function(){

        it('should handle single constraints', function(){
            var node = parser.parse('user.fb != null', 'filter');
            assert.equal(1, node.length);
        });

        it('should handle multiple constraints', function(){
            var node = parser.parse('user.fb != null, credits >= 100', 'filter');
            assert.equal(2, node.length);
        });

        it('should parse mixed filters', function(){
            var node = parser.parse('id > 10, dings = range(100, 10)', 'filter');
            assert.equal(2, node.length);
        });

        it('should parse mixed filters 2', function(){
            var node = parser.parse('location.address.postalcode > 4500, location.address.postalcode < 4500, deleted = null', 'filter');
            assert.equal(3, node.length);
        });

        it('should ignore leading and trailing commas', function(){
            var node = parser.parse(', location.address.postalcode > 4500, location.address.postalcode < 4500, deleted = null ,', 'filter');
            assert.equal(3, node.length);
        });

        it('should handle single constraints', function(){
            var node = parser.parse('user.fb != null', 'filter');
            assert.equal(1, node.length);
        });

        it('should handle multiple constraints', function(){
            var node = parser.parse('user.fb != null, credits >= 100', 'filter');
            assert.equal(2, node.length);
        });

        it('should parse the like operator in filters', function(){
            var node = parser.parse('name LIKE "some%one"', 'filter');
            assert.equal(1, node.length);
            assert.equal(node[0].operator, 'LIKE');
            assert.equal(node[0].property.name, 'name');
            assert.equal(node[0].value.value, 'some%one');
        });

        it('the like operator should be case insensitive and return the operator in upper case', function(){
            var node = parser.parse('name liKe "some%one", id = 100', 'filter');
            assert.equal(2, node.length);
            assert.equal(node[0].operator, 'LIKE');
            assert.equal(node[0].property.name, 'name');
            assert.equal(node[0].value.value, 'some%one');
        });

        it('should allow whitespace around operators', function(){
            var node = parser.parse('eventData.hidden =true', 'filter');
            assert.strictEqual(true, node[0].value.value);
        });

    });
});