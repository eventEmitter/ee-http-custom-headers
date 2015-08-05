var Class           = require('ee-class'),
    log             = require('ee-log'),
    ValueNode       = require('./ValueNode');

var SelectItem = module.exports = new Class({

      aggregation   : null
    , property      : null
    , _type         : "SelectItem"

    , init: function initialize(property, value){
        this.property    = property;
        this.aggregation = value;
    }

    , isAlias : function(){
        return this.hasAggregation();
    }

    , hasAggregation : function(){
        return this.aggregation !== null;
    }

    , getOperator: function(){
        return this.operator;
    }

    , getProperty: function(){
        return this.property;
    }

    , accept: function(visitor){
        return visitor.visitSelectItem(this);
    }

    , isSelectItem: function(){
        return true;
    }

    , isPropertyNode: function(){
        return false;
    }

    , flatten: function(){
        return this.property;
    }

    , join: function(node){
        return node.addToParentSelectItem(this);
    }

    , addToParentProperty: function(parent){

        var   clone      = this.property.clone()
            , cloneRoot  = clone.getRoot()
            , parentRoot = parent.getRoot();

        cloneRoot.of = parentRoot;
        return new SelectItem(clone, this.aggregation);
    }

    , addToParentSelectItem: function(item){

        var   clone      = this.property.clone()
            , cloneRoot  = clone.getRoot()
            , parentRoot = item.property.getRoot();

        cloneRoot.of = parentRoot;

        return new SelectItem(clone, this.aggregation);
    }

    , addToParentSelection: function(parent){
        return parent.join(this);
    }
});