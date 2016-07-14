var Class           = require('ee-class'),
    log             = require('ee-log'),
    ValueNode       = require('../ValueNode');

var FilterItem = module.exports = new Class({

      operator: null
    , inherits: ValueNode
    , variable: null
    , _type:    "FilterItem"

    , init: function initialize(variable, operator, value){
        initialize.super.call(this, value );
        this.operator = operator;
        this.variable = variable;
    }

    , getOperator: function(){
        return this.operator;
    }

    , getVariable: function(){
        return this.variable;
    }

    , setVariable : function(variableNode) {
        this.variable = variableNode;
        return this;
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
        return visitor.visitFilterItem(this);
    }

    , isComparisonNode: function(){
        return true;
    }
});