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



    describe('access_dot', function(){

        var   access_dot = pAssert.forRule('access_dot')
            , node;

        it('should parse a single access', function(){
            node = compareNodeName(access_dot, '.name', 'name');
            assert.equal(null, node.getParent());
        });

        it('should parse nested accesses', function(){
            node = compareNodeName(access_dot, '.venue.venueFloor.size', 'venue');
            assert(!node.hasParent());
            assert(node.hasAccesses());
            assert.equal(node.leafAccess().name, 'size');
        });

        it('should fail on wildcards (to ensure they are always at the end)', function(){
            access_dot.fail('.venue.*');
        });
    });



    describe('selector', function(){

        var   selector = pAssert.forRule('selector')
            , node;

        it('should parse a valid identifier', function(){

            var   input     = "identificatione"
                , result    = selector.parse(input);

            assert.equal(result.getName(), input);
        });

        it('should parse the wildcard', function(){
            var   input     = "*"
                , result    = selector.parse(input);

            assert(result.isWildcard());
            assert.equal(result.getName(), input);
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

        it('should create a property node ', function(){
            node = selector.parse('testName');
            assert.equal('testName', node.getName());
        });

        it('which has no parent', function(){
            assert.equal(null, node.getParent());
        });

        it('and no tags', function(){
            assert.equal(0, node.getTags().length);
        });

        it('should allow wildcards at the end', function(){
            node  = selector.parse('user.profile.*');

            var leafNode = node.leafAccess();

            assert.equal(node.getName(), 'user');
            assert(!node.hasParent());
            assert.equal(leafNode.getName(), '*');
            assert(leafNode.isWildcard());
        });

        it('allows single wildcards', function(){

            node = selector.parse('*');

            assert.equal('*', node.getName());
            assert(node.isWildcard());
            assert(!node.hasParent());
        });

        it('should handle compound names (properties)', function(){
            node = selector.parse('user.profile.id');

            assert.equal('user', node.getName());
            assert(!node.hasParent());

            assert.equal(node.leafAccess().getName(), 'id');
        });

        it.skip('should create a hierarych', function(){
            var hierarchy = node.getHierarchy();
            assert.equal(3, hierarchy.length);

            assert.equal('user', hierarchy[0].getName());
            assert.equal('profile', hierarchy[1].getName());
            assert.equal('id', hierarchy[2].getName());

            assert.deepEqual(node.getParent(), hierarchy[1]);
        });

        it.skip('should trace their parents', function(){
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
            var   selectStatement   = parser.parse('id', 'select')
                , node              = selectStatement[0];

            assert.equal(selectStatement.length, 1);
            assert.equal('id'   , node.getName());
        });

        it('should handle arbitrary fields', function(){
            var   selectStatement   = parser.parse('id, firstName, lastName, profile.id', 'select')
                , lastItem          = selectStatement[3];

            assert.equal(selectStatement.length, 4);
            assert.equal('id'           , selectStatement[0].getName());
            assert.equal('lastName'     , selectStatement[2].getName());
            assert.equal('profile'      , lastItem.getName());
            assert(lastItem.hasAccesses());
            assert(!lastItem.isAlias());
            assert.equal(lastItem.getAccesses().length, 1);
            assert.equal(lastItem.getAccesses()[0].getName(), 'id');

        });

        it('should ignore leading and trailing commas', function(){
            var selectStatement = parser.parse(', id, firstName, lastName, profile.id ,', 'select');
            assert.equal(selectStatement.length, 4);
        });

        it('should support aggregate functions (aliases)', function(){

            var   selectStatement = parser.parse('profile.rating = avg(profile.items.ratings, true)', 'select')
                , result    = selectStatement[0];

            assert.strictEqual(true , result.getAccesses()[0].isAlias());
            assert.equal('profile'  , result.getName());
            assert(result.hasAccesses());
            assert.equal('rating'  , result.getAccesses()[0].getName());
        });
    });

    describe('ordering', function(){
        it('should handle a single tagged order', function(){
            var   orderStatement    = parser.parse('created DESC', 'order')
                , created           = orderStatement[0];

            assert.equal(1              , orderStatement.length);
            assert.equal(created.getName(), 'created');
            assert.equal(created.getDirection(), 'DESC');

        });

        it('should handle mixed orderings and set ASC as the default direction', function(){

            var   orderStatement    = parser.parse('user.id, user.created RAND', 'order')
                , first             = orderStatement[0]
                , second            = orderStatement[1];

            assert.equal(2, orderStatement.length);
            assert.equal('user', first.getName());
            assert(first.getProperty().hasAccesses());
            assert.equal('ASC', first.getDirection());

            assert.equal('user', second.getName());
            assert(second.getProperty().hasAccesses());
            assert.equal('RAND', second.getDirection());

        });

        it.skip('should handle orderings by action', function(){
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
            assert.equal(node[0].getVariable().name, 'name');
            assert.equal(node[0].getValue().value, 'some%one');
        });

        it('the like operator should be case insensitive and return the operator in upper case', function(){
            var node = parser.parse('name liKe "some%one", id = 100', 'filter');
            assert.equal(2, node.length);
            assert.equal(node[0].operator, 'LIKE');
            assert.equal(node[0].getVariable().name, 'name');
            assert.equal(node[0].getValue().value, 'some%one');
        });

        it('should allow whitespace around operators', function(){
            var node = parser.parse('eventData.hidden =true', 'filter');
            assert.strictEqual(true, node[0].getValue().value);
        });

    });
});