/**
 * Facade that creates intermediate representations from the parse tree.
 */
var   Class   = require('ee-class')
    , log     = require('ee-log')
    , Types   = require('ee-types')
    , nodes   = require('../nodes');

var IR = module.exports = {

    identifier: function(identifier){
        return identifier;
    }

    , access_dot: function(accesses){

        if(accesses.length == 0) return null;

        var   rootName  = accesses.shift().pop()
            , root      = new nodes.VariableNode( rootName )
            , parent    = root;

        while(accesses.length > 0){

            var   current = accesses.shift()
                , node    = new nodes.VariableNode( current.pop() );

            node.addToParent(parent);
            parent = node;
        }

        return root;
    }

    , access_array: function(nestedSelect){
        return nestedSelect;
    }

    , access_extended: function(result){
        return result;
    }

    , wildcard: function(wc){
        return new nodes.VariableNode( wc );
    }

    , selector_base: function(base, dotAccess){
        var baseName = new nodes.VariableNode( base );
        if(dotAccess) dotAccess.addToParent(baseName);

        return baseName;
    }

    , selector_extended: function(base, extendedAccess){
        if (extendedAccess) extendedAccess.addToParent(base.leafAccess());
        return base;
    }

    , selector: function(result){
        return result;
    }

    , arr: function(items){
        items = items || [];
        return new nodes.collections.Collection(items);
    }

    , func: function(name, params){
        return new nodes.ActionNode(name, params);
    }

    , select: function(items){
        var flattened = items.reduce(function(result, item){
            return result.concat(item);
        }, []);
        return new nodes.statements.SelectStatement(flattened);
    }

    , selectItem : function(variable, aliases){
        if(aliases){
            variable.resolveAlias(aliases.pop());
        }
        return variable;
    }

    , filter: function(comparisons){
        return new nodes.statements.FilterStatement(comparisons);
    }

    , comp: function(name, operator, value){
        return new nodes.statements.FilterItem(name, operator, value);
    }

    , date: function(year, month, day, hour, min, sec) {
        var date = new Date(year, month-1, day, hour, min, sec, 0);
        return new nodes.ValueNode(date);
    }

    , order: function(items){
        return new nodes.statements.OrderStatement(items);
    }

    , order_item: function(base, direction){
        return new nodes.statements.OrderItem(base, direction);
    }

    , literal: function(value){
        return new nodes.ValueNode(value);
    }

    , null: function(value){
        return null;
    }

    , values: function(elements){
        return new nodes.collections.Collection(elements);
    }
};