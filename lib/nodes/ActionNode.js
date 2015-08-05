var Class           = require('ee-class'),
    NamedNode       = require('./NamedNode'),
    Collection      = require('./collections/Collection');

/*
 * Represents a function/action to take
 */
var ActionNode = module.exports = new Class({

      inherits  : NamedNode

    , parameters    : []

    , init: function initialize(options){
        initialize.super.call(this, options);
        this.parameters = options.parameters || new Collection([]);
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