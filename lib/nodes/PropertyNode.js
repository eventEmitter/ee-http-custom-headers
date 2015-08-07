var   Class     = require('ee-class')
    , Types     = require('ee-types')
    , log       = require('ee-log')
    , NamedNode = require('./NamedNode');

var PropertyNode = module.exports = new Class({

      inherits      : NamedNode
    , of            : null
    , aggregation   : null

    , tags      : []
    , _type     : "PropertyNode"

    , init: function initialize(options){
        initialize.super.call(this, options);
        this.of     = options.of || null;
        this.accesses    = [];
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

    , accept: function(visitor){
        return visitor.visitPropertyNode(this);
    }

    , isWildcard: function(){
        return this.name === '*';
    }

    , isPropertyNode: function(){
        return true;
    }

    , isSelectItem: function(){
        return false;
    }

    , addToParent: function(propertyNode){
        propertyNode.accesses.push(this);
        this.of = propertyNode;
        return this;
    }

    , hasAccesses: function(){
        return this.accesses.length > 0;
    }

    , getAccesses: function(){
        return this.accesses;
    }

    , setAccesses: function(accesses){
        this.accesses = accesses;
        return this;
    }

    , addAccess: function(access){
        this.accesses.push(access);
        return this;
    }

    , isLinear: function(){
        return !this.hasAccesses()
                || (this.getAccesses().length == 1 && this.getAccesses()[0].isLinear());
    }

    , leafAccess: function(){
        if(!this.hasAccesses()) return this;
        return this.accesses[0].leafAccess();
    }

    , isWildcard: function(){
        return this.getName() === '*';
    }

    , flatten: function(){
        return this;
    }
});