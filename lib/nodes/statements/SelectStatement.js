var Class     = require('ee-class'),
    Sequence  = require('../collections/Sequence');

/**
 * Represents a select statement, the only sense is to make the context available to the visitor.
 */
var SelectStatement = module.exports = new Class({

      _type: "SelectStatement"

    , inherits: Sequence

    , accept: function(visitor){
        return visitor.visitSelectStatement(this);
    }

    , clone: function(){
        return this.cloneAllAs(SelectStatement);
    }
});