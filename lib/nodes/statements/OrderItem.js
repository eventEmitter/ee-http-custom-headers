var Class           = require('ee-class'),
    log             = require('ee-log'),

    ValueNode       = require('../ValueNode');

var OrderItem = module.exports = new Class({

      inherits  : ValueNode
    , direction : null
    , _type:    "OrderItem"

    , init: function initialize(value, direction){
        initialize.super.call(this, { value: value });
        this.direction = direction || 'ASC';

    }

    , getName: function(){
        return this.getProperty().getName();
    }

    , getProperty: function(){
        return this.getValue();
    }

    , getDirection: function(){
        return this.direction;
    }

    , accept: function(visitor){
        return visitor.visitOrderItem(this);
    }

    , isComparisonNode: function(){
        return true;
    }
});