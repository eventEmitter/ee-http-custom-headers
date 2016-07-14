var   log     = require('ee-log')
    , assert  = require('assert')
    , parser  = require('../lib/parser/HeaderParser')
    , pAssert = require('./ParserAssertion').forParser(parser);

describe('Parser-Structures', function(){

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

    describe('array', function() {
        var arr = pAssert.forRule('array');
        it('should parse an empty array', function () {
            assert.equal(arr.parse('[]').length , 0);
        });

        it('should parse an array with arbitrary literals', function () {
            var result = arr.parse('[ true, false, 100, -100.1 , "yay"]');
            assert.equal(result.length , 5);
            assert.strictEqual(result[0].value, true);
            assert.strictEqual(result[3].value, -100.1);
        });

        it('should parse nested arrays', function () {
            var result = arr.parse('[ "range", [10, 400]]');
            assert.equal(result.length , 2);
            assert.equal(result[0].value, "range");
            assert.strictEqual(result[1].length, 2);
        });

        it('should parse an array with structural contents', function(){
            var result = arr.parse('[ abs(-100),  post.title, []]');
            assert.equal(result.length, 3);
            assert.equal(result[0].parameters[0].value, -100);
        });
    });

    describe('function', function(){
        var fnc = pAssert.forRule('function');
        it('should parse a function call without arguments', function(){
            var result = fnc.parse('avg()');
            assert.equal(result.name, 'avg');
            assert.equal(result.parameters.length, 0);
        });

        it('should parse a function call with an arbitrary amount of arguments', function(){
            var result = fnc.parse('fork(post.ratings, post.comments, 100)');;
            assert.equal(result.name, 'fork');
            assert.equal(result.parameters.length, 3);
        });
    });

    describe('selector', function(){
        var sel = pAssert.forRule('selector');
        it('should parse the wildcard', function(){
            //{ name: '*', parent: null, accesses: [] }
            var result = sel.parse('*');
            assert.equal(result.name, '*' );
        });
        it('should fail on accesses on wildcard', function(){
            sel.fail('*.halo');
        });

        it('should parse variables', function(){
            var result = sel.parse('event');
            assert.equal(result.name, 'event' );
            assert.equal(result.accesses.length, 0);
        });

        it('should parse wildcard acceses on variables', function(){
            var result = sel.parse('event.*');
            assert.equal(result.name, 'event' );
            assert.equal(result.accesses.length, 1);
            assert.equal(result.accesses[0].name, '*');
        });

        it('should parse an arbitrary amount of accesses on variables', function(){
            var result = sel.parse('event.address.city.postalcode');
            assert.equal(result.name, 'event' );
            assert.equal(result.accesses.length, 1);
            assert.equal(result.accesses[0].name, 'address');
            assert.equal(result.accesses[0].accesses[0], 'city');
            assert.equal(result.accesses[0].accesses[0].accesses[0], 'postalcode');
        });

        it('should provide access to the names of the accessed properties', function(){
            var result = sel.parse('event.address.city.postalcode');
            assert(result.hasAccess('address'));
            assert(result.getAccess('address').hasAccesses());
        });
    });

    describe('nested-selector', function(){
        var sel = pAssert.forRule('selector');
        it('should parse nested selectors', function(){
            var result = sel.parse('event[venue , date]');
            assert(result.hasAccesses());
            assert.equal(result.getAccesses().length, 2);
            assert.equal(result.getAccesses()[0].name, 'venue');
            assert.equal(result.getAccesses()[1].name, 'date');
        });

        it('should parse selectors with an arbitrary amount of nesting', function(){
            var   result = sel.parse('event[venue[name, address] , date]')
                , venueAccess
                , dateAccess;

            assert(result.hasAccesses());
            assert.equal(result.getAccesses().length, 2);

            venueAccess = result.getAccess('venue');
            dateAccess = result.getAccess('date');

            assert(venueAccess.hasAccesses());

            assert(!dateAccess.hasAccesses());
        });

        it('should allow aliases within the nesting', function(){
            var   result = sel.parse('event[venue[name, address = location(100, -200.30)]]')
                , address = result.getAccesses()[0].getAccesses()[1];

            assert(address.isAlias());
        });
    });
});