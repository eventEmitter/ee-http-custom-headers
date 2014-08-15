var Class       = require('ee-class'),
    NamedNode   = require('./NamedNode');

/*
 * Represents a function/action to take
 */
var ActionNode = module.exports = new Class({

      inherits:     NamedNode
    , _type:        'ActionNode'
    , parameters:   null

    , init: function init(name, parameters){
        init.super.call(this, name);
        this.parameters = parameters || [];
    }

    , getParameters: function(){
        return this.parameters;
    }

    , hasParameters: function(){
        return this.parameters.length > 0;
    }

    , accept: function(visitor){
        return visitor.visitActionNode(this);
    }
});