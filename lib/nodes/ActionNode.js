var   Class       = require('ee-class')
    , Types       = require('ee-types')

    , NamedNode   = require('./NamedNode')
    , Collection  = require('./collections/Collection');


/*
 * Represents a function/action to take
 */
var ActionNode = module.exports = new Class({

      inherits:     NamedNode
    , _type:        'ActionNode'
    , parameters:   null

    , init: function init(name, parameters){
        init.super.call(this, name);
        this.parameters = parameters;
        if(!parameters){
            this.parameters = new Collection();
        } else if(Types.array(parameters)){
            this.parameters = new Collection(parameters);
        }
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

    , clone : function(){
        return new ActionNode(this.getName(), this.getParameters().clone());
    }
});