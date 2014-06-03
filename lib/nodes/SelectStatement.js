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
});