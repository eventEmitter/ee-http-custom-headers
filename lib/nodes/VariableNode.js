var Class           = require('ee-class'),
    PropertyNode    = require('./PropertyNode');

var VariableNode = module.exports = Class({

    inherits: PropertyNode

    , accept: function(visitor){
        return visitor.visitVariable(this);
    }
});