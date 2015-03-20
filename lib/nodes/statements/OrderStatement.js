var Class           = require('ee-class'),
    Sequence  = require('../collections/Sequence');

/**
 * Represents a select statement, the only sense is to make the context available to the visitor.
 */
var OrderStatement = module.exports = new Class({

      _type: "OrderStatement"
    , inherits: Sequence

    , accept: function(visitor){
        return visitor.visitOrderStatement(this);
    }

    , clone: function(){
        return this.cloneAllAs(OrderStatement);
    }
});