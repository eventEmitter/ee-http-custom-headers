var assert  = require('assert'),

    log     = require('ee-log'),

    nodes   = require('../lib/nodes');

describe('ASTNodes', function(){

    describe('NamedNode', function(){

        it('should be cloneable', function(){

            var   node   = new nodes.NamedNode('test')
                , cloned = node.clone();

            assert.notStrictEqual(node, cloned);

            node.name = 'testo';

            assert.notEqual(cloned.name, 'testo');
        });

    });

    describe('ValueNode', function(){

        it('should be cloneable', function(){

            var   node   = new nodes.ValueNode('test')
                , cloned = node.clone();

            assert.notStrictEqual(node, cloned);

            node.value = null;

            assert.notEqual(cloned.getValue(), 'testo');
            assert(node.isNull());
        });

    });

    describe('Identifier', function(){

        it('should be cloneable', function(){

            var   accesses  = ['my', 'access']
                , node      = new nodes.Identifier('test', accesses)
                , cloned    = node.clone();

            assert.notStrictEqual(node, cloned);
            assert.equal('test', cloned.getName());
            assert.deepEqual(accesses, cloned.getAccesses());

            node.getAccesses().pop();
            assert.deepEqual(['my', 'access'], cloned.getAccesses());
            assert(1, node.getAccesses().length);
        });

    });

    describe('ActionNode', function(){

        it('should be cloneable', function(){

            var   value1    = new nodes.ValueNode(10)
                , value2    = new nodes.ValueNode(20)
                , node      = new nodes.ActionNode('inRange', [value1, value2])
                , cloned    = node.clone();

            assert.notStrictEqual(node, cloned);
            assert.notStrictEqual(node.getParameters(), cloned.getParameters());

            assert.equal('inRange', cloned.getName());
            assert.deepEqual(node.getParameters(), cloned.getParameters());

            assert.notStrictEqual(node.getParameters().first, cloned.getParameters().first);
            assert.equal(node.getParameters().first.value, cloned.getParameters().first.value);
            assert.equal(node.getParameters().last.value, cloned.getParameters().last.value);
        });

    });

    describe('Collection (Sequence, Choice, FilterStatement, SelectStatement, OrderStatement)', function(){

        it('should be cloneable', function(){
            var   value1    = new nodes.ValueNode(10)
                , value2    = new nodes.ValueNode('two')
                , value3    = new nodes.ValueNode(true)
                , value4    = new nodes.ArrayCollection([1, 2, 3])

                , node      = new nodes.Collection([ value1, value2, value3, value4])
                , cloned    = node.clone();

            assert.notStrictEqual(node, cloned);
            assert.deepEqual(node, cloned);

            assert.notStrictEqual(node.first, cloned.first);
            assert.equal(node.first.value, cloned.first.value);

            assert.notStrictEqual(node.last, cloned.last);
            assert.deepEqual(node.last, cloned.last);
        });

    });

    describe('Comparison', function(){

        it('should be cloneable', function(){

            var   identifier= new nodes.Identifier('my', ['belly', 'size'])
                , value     = new nodes.ValueNode('big')

                , node      = new nodes.Comparison(identifier, 'like', value)
                , cloned    = node.clone();

            assert.notStrictEqual(node, cloned);
            assert.deepEqual(node, cloned);

            assert.notStrictEqual(node.identifier, cloned.identifier);
            assert.deepEqual(node.identifier, cloned.identifier);

            assert.notStrictEqual(node.value, cloned.value);
            assert.deepEqual(node.value, cloned.value);

            node.comparator = '<';

            assert.equal('<', node.comparator);
            assert.equal('like', cloned.comparator);
        });

    });

    describe('Ordering', function(){

        it('should have a default direction of ASC', function(){
            var   identifier    = new nodes.Identifier('property')
                , node          = new nodes.Ordering(identifier);

            assert.equal('ASC', node.direction);
        });

        it('should have a default direction of ASC if an empty string is passed to the constructor', function(){
            var   identifier    = new nodes.Identifier('property')
                , node          = new nodes.Ordering(identifier, '');

            assert.equal('ASC', node.direction);
        });

        it('should be cloneable', function(){

            var   identifier    = new nodes.Identifier('my', ['biggest', 'hits', 'rating'])
                , node          = new nodes.Ordering(identifier)
                , clone         = node.clone();



            assert.notStrictEqual(node, clone);
            assert.deepEqual(node, clone);

            node.direction = 'DESC';

            assert.equal('ASC', clone.direction);
        });

    });

});