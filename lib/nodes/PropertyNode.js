var Class       = require('ee-class'),
    NamedNode   = require('./NamedNode');

var PropertyNode = module.exports = Class({

    inherits: NamedNode
    , of: null
    , init: function initialize(options){
        initialize.parent(options);
        this.of = options.of || null;
    }

    , getParent: function(){
        return this.of;
    }
    , hasParent: function(){
        return this.of !== null;
    }

    , getRoot: function(){
        return this.hasParent() ? this.parent.getRoot() : this;
    }

    , getHierarchy: function(){
        if(this.hasParent()){
            var hierarchy = this.getParent().getHierarchy()
            hierarchy.push(this);
            return hierarchy;
        }
        return [this];
    }

    , accept: function(visitor){
        return visitor.visitPropertyNode(this);
    }
});