var Class           = require('ee-class'),
    log             = require('ee-log'),
    ValueNode       = require('./ValueNode');

var ComparisonNode = module.exports = Class({
    operator: null
    , inherits: ValueNode
    , property: null

    , init: function initialize(options){
        initialize.parent(options);
        this.operator = options.operator;
        this.property = options.property;
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
        for(var name in visitor){
            if(typeof visitor[name] == 'function'){
                console.log(name);
            }
        }
        return visitor.visitComparisonNode(this);
    }

    , isComparisonNode: function(){
        return true;
    }
});