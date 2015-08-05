var Class           = require('ee-class'),
    NodeCollection  = require('./NodeCollection');

/**
 * Represents a select statement, the only sense is to make the context available to the visitor.
 */
var SelectStatement = module.exports = new Class({

    _type: "SelectStatement"

    , inherits: NodeCollection

    , accept: function(visitor){
        return visitor.visitSelectStatement(this);
    }

    , addToParentSelection: function(parent){
        return this.map(function(item){
            // this is usually a property node
            var clone = parent.clone();
            // the problem is, the elements of the select statement are select items so we need to return a select item
            return item.addToParentSelection(parent);
        });
    }

    , isWildcard: function(){
        return false;
    }

    , flatten: function(){
        return this.reduce(function(result, item){
            return result.concat(item.flatten());
        }, []);
    }
});