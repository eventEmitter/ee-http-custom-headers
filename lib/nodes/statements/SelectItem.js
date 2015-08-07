var Class           = require('ee-class'),
    log             = require('ee-log'),

    ValueNode       = require('../ValueNode');

var SelectItem = module.exports = new Class({

      aggregation   : null
    , property      : null
    , _type         : "SelectItem"

    , init: function initialize(property, value){
        this.property    = property;
        this.aggregation = value || null;
    }

    , getName : function(){
        return this.property.getName();
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
});