var Class           = require('ee-class'),
    log             = require('ee-log'),
    ValueNode       = require('./ValueNode');

var SelectItem = module.exports = new Class({

      value     : null
    , property  : null
    , _type     :   "SelectItem"

    , init: function initialize(property, value){
        this.property   = property;
        this.value      = value;
    }

    , isAlias : function(){
        return this.hasValue();
    }

    , hasValue : function(){
        return !!this.value;
    }

    , getOperator: function(){
        return this.operator;
    }

    , getProperty: function(){
        return this.property;
    }

    , _hasOperator: function(op){
        return this.getOperator() === op;
    }

    , testsEquality: function(){
        return this._hasOperator('=');
    }

    , testsLessThan: function(){
        return this._hasOperator('<');
    }

    , testsMoreThan: function(){
        return this._hasOperator('>');
    }
    , testsLessOrEqual: function(){
        return this._hasOperator('<=');
    }

    , testsMoreOrEqual: function(){
        return this._hasOperator('>=');
    }

    , testsInequality: function(){
        return this._hasOperator('!=');
    }
    , accept: function(visitor){
        return visitor.visitComparisonNode(this);
    }

    , isComparisonNode: function(){
        return true;
    }
});