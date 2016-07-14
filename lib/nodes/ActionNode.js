var Class           = require('ee-class'),
    NamedNode       = require('./NamedNode'),
    Collection      = require('./collections/Collection');

/*
 * Represents a function/action to take
 */
var ActionNode = module.exports = new Class({

      inherits  : NamedNode
    , parameters    : []
    , children : { get: function(){ return this.parameters; }}

    , init: function initialize(name, parameters){
        initialize.super.call(this, name);
        this.parameters = parameters || new Collection([]);
    }

    , getParameters: function(){
        return this.parameters;
    }

    , hasParameters: function(){
        return this.parameters.length > 0;
    }

    , addToParent : function(node) {
        node.setAlias(this);
        return this;
    }

    , accept: function(visitor){
        return visitor.visitActionNode(this);
    }

});