var Class           = require('ee-class'),
    Choice        = require('./../collections/Choice');

/**
 * Represents a select statement, the only sense is to make the context available to the visitor.
 */
var FilterStatement = module.exports = new Class({

      _type: "FilterStatement"
    , inherits: Choice

    , accept: function(visitor){
        return visitor.visitFilterStatement(this);
    }
});