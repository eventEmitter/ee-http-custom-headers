/**
 * Facade that creates intermediate representations from the parse tree.
 */
var Class   = require('ee-class'),
    log     = require('ee-log'),
    nodes   = require('./nodes');

var IR = module.exports = {

    name: function(name){
      return new nodes.VariableNode({name: name});
    }

    , name_dotted: function(names){
        var variable = names.shift(),
            property;

        while(names.length){
            var name = names.shift().getName();
            property = new nodes.PropertyNode({name: name, of: variable});
            variable = property;
        }

        return variable;
    }

    , name_tagged: function(variable, tag){
        var parent = variable;
        while(parent){
            parent.getTags().push(tag.getName());
            parent = parent.getParent();
        }
        return variable;
    }

    , arr: function(items){
        return new nodes.NodeCollection(items);
    }

    , func: function(name, params){
        return new nodes.ActionNode({name:name, parameters: params});
    }

    , select: function(items){
        return nodes.SelectStatement(items);
    }

    , filter: function(comparisons){
        return nodes.FilterStatement(comparisons);
    }

    , comp: function(name, operator, value){
        return new nodes.ComparisonNode({operator: operator, value: value, property: name});
    }

    , date: function(year, month, day, hour, min, sec){
        var date = new Date(year, month-1, day, hour, min, sec, 0);
        return new nodes.ValueNode({value: date});
    }

    , order: function(names){
        return nodes.OrderStatement(names);
    }

    , literal: function(value){
        return new nodes.ValueNode({value: value});
    }

    , values: function(elements){
        var collection = new nodes.NodeCollection(elements);
        return collection;
    }
};