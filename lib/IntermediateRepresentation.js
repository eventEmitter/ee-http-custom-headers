/**
 * Facade that creates intermediate representations from the parse tree.
 */
var   Class   = require('ee-class')
    , log     = require('ee-log')
    , Types   = require('ee-types')
    , nodes   = require('./nodes');

//log = function(){};

var IR = module.exports = {

    identifier: function(identifier){
        return identifier;
    }

    /**
     * access_dot is now recursive. Therefore the accesses (are also property nodes, if present).
     * @param name
     * @param accesses
     * @returns nodes.PropertyNode
     */
    , access_dot: function(accesses){

        if(accesses.length == 0) return null;

        var   rootName  = accesses.shift().pop()
            , root      = new nodes.PropertyNode({ name: rootName })
            , parent    = root;

        while(accesses.length > 0){

            var   current = accesses.shift()
                , node    = new nodes.PropertyNode({ name: current.pop() });

            node.addToParent(parent);

            parent = node;
        }

        return root;
    }

    , access_array: function(nestedSelect){
        // convert the elements recursively to accesses
        return nestedSelect;
    }

    , access_extended: function(result){
        return result;
    }

    , wildcard: function(wc){
        return new nodes.PropertyNode({ name: wc });
    }

    , selector_base: function(base, dotAccess, extendedAccess){
        /** identifier access_dot access_extended? */
        var baseName = new nodes.PropertyNode({name: base});
        if(dotAccess) dotAccess.addToParent(baseName);

        if(extendedAccess && !Types.function(extendedAccess.addToParent)){
            log(extendedAccess);
        }
        if(extendedAccess) extendedAccess.addToParent(baseName.leafAccess());
        return baseName;
    }

    /**
     * Must return an array, since a selector now can represent multiple selections.
     * Add a dedicated compound entity to the SelectItem
     * @param result
     * @returns {*}
     */
    , selector: function(result){
        // name and optional accesses
        return result;
    }

    , arr: function(items){
        items = items || [];
        return new nodes.collections.Collection(items);
    }

    , func: function(name, params){
        return new nodes.ActionNode({name:name, parameters: params});
    }

    , select: function(items){
        var flattened = items.reduce(function(result, item){
            return result.concat(item);
        }, []);
        return new nodes.SelectStatement(flattened);
    }

    , selectItem : function(property, aggregate){
        if(aggregate) property.aggregation = aggregate;
        return property;
    }

    , filter: function(comparisons){
        return new nodes.FilterStatement(comparisons);
    }

    , comp: function(name, operator, value){
        return new nodes.ComparisonNode({operator: operator, value: value, property: name});
    }

    , date: function(year, month, day, hour, min, sec){

        var date = new Date(year, month-1, day, hour, min, sec, 0);
        return new nodes.ValueNode({value: date});
    }

    , order: function(names){
        return new nodes.OrderStatement(names);
    }

    , literal: function(value){
        return new nodes.ValueNode({value: value});
    }

    , null: function(value){
        return null;
    }

    , values: function(elements){
        return new nodes.collections.Collection(elements);
    }
};