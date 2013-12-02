var Class           = require('ee-class');

var ComparisonNode = module.exports = Class({
    operator: null
    , property: null
    , value: null

    , init: function initialize(options){
        this.operator = options.operator;
        this.property = options.property;
        this.value = options.value;
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
        return visitor.visitComparison(this);
    }
});