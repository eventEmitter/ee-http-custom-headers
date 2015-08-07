var Class           = require('ee-class'),
    Collection      = require('../collections/Collection');

/**
 * Represents a select statement, the only sense is to make the context available to the visitor.
 */
var SelectStatement = module.exports = new Class({

      _type: "SelectStatement"

    , inherits: Collection

    , accept: function(visitor){
        return visitor.visitSelectStatement(this);
    }

    , addToParent: function(parent){
        this.forEach(function(item){
            item.addToParent(parent);
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