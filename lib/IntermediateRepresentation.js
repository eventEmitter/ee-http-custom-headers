/**
 * Facade that creates intermediate representations from the parse tree.
 */
var Class   = require('ee-class'),
    log     = require('ee-log'),
    nodes   = require('./nodes');

var IR = module.exports = {

    strSep: function(elements){
        elements = elements || [];
        return elements.map(function(value, index){
            if(value.length == 2){
                return value[1];
            }
            return value;
        });
    }

    , identifier: function(name, accessors){
        return new nodes.Identifier(name, this.strSep(accessors));
    }

    , arr: function(items){
        items = items || new nodes.Collection();
        return items;
    }

    , func: function(name, params){
        return new nodes.ActionNode(name, params);
    }

    , select: function(items){
        return new nodes.SelectStatement(this.strSep(items));
    }

    , filter: function(comparisons){
        return new nodes.FilterStatement(comparisons);
    }

    , comp: function(access, comparator, value){
        return new nodes.Comparison(access, comparator, value);
    }

    , date: function(year, month, day, hour, min, sec){

        var date = new Date(year, month-1, day, hour, min, sec, 0);
        return new nodes.ValueNode(date);
    }

    , order: function(item, remainder){
        return new nodes.OrderStatement(this.flatten(item, remainder));
    }

    , literal: function(value){
        return new nodes.ValueNode(value);
    }

    , values: function(first, remainder){
        return new nodes.Collection(this.flatten(first, remainder));
    }

    , choice: function(first, remainder){
        return new nodes.Choice(this.flatten(first, remainder));
    }

    , sequence: function(first, remainder){
        return new nodes.Sequence(this.flatten(first, remainder));
    }

    , ordering: function(value, direction){
        return new nodes.Ordering(value, direction);
    }

    , flatten: function(start, remainder){
        return [start].concat(this.strSep(remainder));
    }
};