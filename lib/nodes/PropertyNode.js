var Class       = require('ee-class'),
    NamedNode   = require('./NamedNode');

var PropertyNode = module.exports = new Class({

    inherits: NamedNode
    , of: null
    , tags: []
    , _type: "PropertyNode"

    , init: function initialize(options){
        initialize.super.call(this, options);
        this.of = options.of || null;
        this.tags = options.tags || [];
    }

    , getTags: function(){
        return this.tags;
    }

    , hasTags: function(){
        return this.tags.length !== 0;
    }

    , getParent: function(){
        return this.of;
    }
    , hasParent: function(){
        return this.of !== null;
    }

    , getRoot: function(){
        return this.hasParent() ? this.getParent().getRoot() : this;
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

    , isPropertyNode: function(){
        return true;
    }
    , getNames: function(){
        var names = [];
        this.getHierarchy().forEach(function(value){
            names.push(value.getName());
        });
        return names;
    }
    , flattenName: function(){
        return this.getNames().join('.');
    }
});