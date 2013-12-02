var Class           = require('ee-class'),
    PropertyNode    = require('./PropertyNode');

var VariableNode = module.exports = Class({
    inherits: PropertyNode
    , tags: []
    , init: function initialize(options){
        initialize.parent(options);
        this.tags = options.tags || [];
    }

    , getTags: function(){
        return this.tags;
    }

    , hasTags: function(){
        return this.tags.length !== 0;
    }
    , accept: function(visitor){
        return visitor.visitVariable(this);
    }
});