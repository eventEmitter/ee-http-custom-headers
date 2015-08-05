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
    , access_dot: function(name, accesses){
        var node = new nodes.PropertyNode({name: name});
        if(!accesses) return node;
        return accesses.addToParentSelection(node);
    }

    // we need to convert that to a regular access (actually it is a regular access?)
    , access_array: function(nestedSelect){
        return nestedSelect;
    }

    , access_extended: function(result){
        return result;
    }

    , selector_base: function(identifier, access_dot){
        var baseName = new nodes.PropertyNode({name: identifier});
        if(!access_dot) return baseName;
        return access_dot.addToParentSelection(baseName);
    }

    /**
     * Must return an array, since a selector now can represent multiple selections.
     * Add a dedicated compound entity to the SelectItem
     * @param result
     * @returns {*}
     */
    , selector: function(result){
        // name and optional accesses
        var   baseSelector      = result[0]
            , extendedAccess    = result[1];

        if(!extendedAccess) return baseSelector;
        if(extendedAccess.isWildcard()) return extendedAccess.addToParentSelection(baseSelector);
        return extendedAccess.map(function(item){
            return baseSelector.join(item);
        });
    }

    , arr: function(items){
        items = items || [];
        return new nodes.NodeCollection(items);
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
        var aggregateValue = (aggregate) ? aggregate[3] : aggregate
            , prop         = Types.array(property) ? property : [property];

        return prop.map(function(item){
            if(item.isPropertyNode()){
                return new nodes.SelectItem(item, aggregateValue);
            }
            return property.join(item);
        });
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
        return new nodes.NodeCollection(elements);
    }
};