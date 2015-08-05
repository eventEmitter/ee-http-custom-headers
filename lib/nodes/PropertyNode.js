var   Class     = require('ee-class')
    , Types     = require('ee-types')
    , log       = require('ee-log')
    , NamedNode = require('./NamedNode');

var PropertyNode = module.exports = new Class({

      inherits  : NamedNode
    , of        : null
    , tags      : []
    , _type     : "PropertyNode"

    , init: function initialize(options){
        initialize.super.call(this, options);
        this.of     = options.of || null;
        this.tags   = options.tags || [];
        if(Types.array(options.name)){
            var some = true;
        }
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
            var hierarchy = this.getParent().getHierarchy();
            hierarchy.push(this);
            return hierarchy;
        }
        return [this];
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

    , clone: function(){
        return new PropertyNode({
              name  : this.getName()
            , of    : (this.hasParent()) ? this.getParent().clone() : null
            , tags  : this.getTags().slice(0)
        });
    }

    , addToParentSelection: function(parent){
        var root = this.getRoot();
        root.of = parent;
        return this;
    }

    , join: function(node){
        console.log(node);
        return node.addToParentProperty(this);
    }

    , flatten: function(){
        return this;
    }
});