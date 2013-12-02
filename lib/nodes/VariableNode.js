var Class           = require('ee-class'),
    PropertyNode    = require('./PropertyNode');

var VariableNode = module.exports = Class({

    inherits: PropertyNode
    , _type: "VariableNode"
    , accept: function(visitor){
        return visitor.visitVariableNode(this);
    }
});