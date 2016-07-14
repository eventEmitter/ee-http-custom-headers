var Class           = require('ee-class'),
    log             = require('ee-log'),

    VariableNode       = require('../VariableNode');

var SelectItem = module.exports = new Class({

      inherits      : VariableNode
    , _type         : "SelectItem"
    , aggregation   : null

    , hasAlias : function(){
        return this.getAggregation() !== null;
    }

    , getAlias : function(){
        return this.aggregation;
    }

    , setAlias : function(alias){
        this.aggregation = alias;
    }

    , accept: function(visitor){
        return visitor.visitSelectItem(this);
    }

    , isSelectItem: function(){
        return true;
    }
});