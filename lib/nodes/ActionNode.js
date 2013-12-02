var Class       = require('ee-class'),
    NamedNode   = require('./NamedNode');

/*
 * Represents a function/action to take
 */
var ActionNode = module.exports = Class({
    inherits: NamedNode
    , parameters: []
    , init: function initialize(options){
        initialize.parent(options);
        this.parameters = options.parameters || [];
    }
    , getParameters: function(){
        return this.parameters;
    }
    , hasParameters: function(){
        return this.parameters.length > 0;
    }
    , accept: function(visitor){
        return visitor.visitAction(this);
    }
});